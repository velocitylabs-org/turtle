import { u8aToHex } from '@polkadot/util'
import { blake2AsU8a, encodeAddress } from '@polkadot/util-crypto'
import { environment, subscan, history, status, Context, utils } from '@snowbridge/api'
import { SnowbridgeEnvironment } from '@snowbridge/api/dist/environment'
import {
  ToEthereumTransferResult,
  ToPolkadotTransferResult,
  TransferStatus,
} from '@snowbridge/api/dist/history'
import { BeefyClient__factory, IGateway__factory } from '@snowbridge/contract-types'
import { AlchemyProvider } from 'ethers'

export const SKIP_LIGHT_CLIENT_UPDATES = true
export const HISTORY_IN_SECONDS = 60 * 60 * 24 * 7 * 2 // 2 Weeks
export const ETHEREUM_BLOCK_TIME_SECONDS = 12
export const ACCEPTABLE_BRIDGE_LATENCY = 28800 // 8 hours

export async function getTransferHistory(
  env: environment.SnowbridgeEnvironment,
  skipLightClientUpdates: boolean,
  historyInSeconds: number,
) {
  console.log('Fetching transfer history.')
  if (!env.config.SUBSCAN_API) {
    console.warn(`No subscan api urls configured for ${env.name}`)
    return []
  }
  const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_KEY
  if (!alchemyKey) {
    throw Error('Missing Alchemy Key')
  }

  const subscanKey = process.env.NEXT_PUBLIC_SUBSCAN_KEY
  if (!subscanKey) {
    throw Error('Missing Subscan Key')
  }

  const ethereumProvider = new AlchemyProvider(env.ethChainId, alchemyKey)

  const assetHubScan = subscan.createApi(env.config.SUBSCAN_API.ASSET_HUB_URL, subscanKey)
  const bridgeHubScan = subscan.createApi(env.config.SUBSCAN_API.BRIDGE_HUB_URL, subscanKey)
  const relaychainScan = subscan.createApi(env.config.SUBSCAN_API.RELAY_CHAIN_URL, subscanKey)

  const bridgeHubParaId = env.config.BRIDGE_HUB_PARAID
  const assetHubParaId = env.config.ASSET_HUB_PARAID
  const beacon_url = env.config.BEACON_HTTP_API

  const beefyClient = BeefyClient__factory.connect(env.config.BEEFY_CONTRACT, ethereumProvider)
  const gateway = IGateway__factory.connect(env.config.GATEWAY_CONTRACT, ethereumProvider)
  const ethereumSearchPeriodBlocks = historyInSeconds / ETHEREUM_BLOCK_TIME_SECONDS

  const ethNowBlock = await ethereumProvider.getBlock('latest', false)
  const now = new Date()
  const utcNowTimestamp = Math.floor(now.getTime() / 1000)

  const toAssetHubBlock = await subscan.fetchBlockNearTimestamp(assetHubScan, utcNowTimestamp)
  const fromAssetHubBlock = await subscan.fetchBlockNearTimestamp(
    assetHubScan,
    utcNowTimestamp - historyInSeconds,
  )

  const toBridgeHubBlock = await subscan.fetchBlockNearTimestamp(bridgeHubScan, utcNowTimestamp)
  const fromBridgeHubBlock = await subscan.fetchBlockNearTimestamp(
    bridgeHubScan,
    utcNowTimestamp - historyInSeconds,
  )

  if (ethNowBlock === null) {
    throw Error('Could not fetch latest Ethereum block.')
  }

  const searchRange = {
    assetHub: {
      fromBlock: fromAssetHubBlock.block_num,
      toBlock: toAssetHubBlock.block_num,
    },
    bridgeHub: {
      fromBlock: fromBridgeHubBlock.block_num,
      toBlock: toBridgeHubBlock.block_num,
    },
    ethereum: {
      fromBlock: ethNowBlock.number - ethereumSearchPeriodBlocks,
      toBlock: ethNowBlock.number,
    },
  }
  console.log('Search ranges:', searchRange)

  const toEthereum = await history.toEthereumHistory(
    assetHubScan,
    bridgeHubScan,
    relaychainScan,
    searchRange,
    skipLightClientUpdates,
    env.ethChainId,
    assetHubParaId,
    beefyClient,
    gateway,
  )
  console.log('To Ethereum transfers:', toEthereum.length)

  const toPolkadot = await history.toPolkadotHistory(
    assetHubScan,
    bridgeHubScan,
    searchRange,
    skipLightClientUpdates,
    bridgeHubParaId,
    gateway,
    ethereumProvider,
    beacon_url,
  )
  console.log('To Polkadot transfers:', toPolkadot.length)

  const transfers = [...toEthereum, ...toPolkadot]
  transfers.sort((a, b) => b.info.when.getTime() - a.info.when.getTime())
  return transfers
}

export interface AccountInfo {
  name: string
  type: 'ethereum' | 'substrate'
  account: string
  balance: string
}

export function getTransferStatus(
  transferResult: ToEthereumTransferResult | ToPolkadotTransferResult,
) {
  if (transferResult.info.destinationParachain == undefined)
    return getTransferStatusToEthereum(transferResult as ToEthereumTransferResult)
  else {
    return getTransferStatusToPolkadot(transferResult as ToPolkadotTransferResult)
  }
}

export function getTransferStatusToEthereum(transferResult: ToEthereumTransferResult) {
  const { status, submitted, bridgeHubChannelDelivered } = transferResult

  switch (status) {
    case TransferStatus.Pending:
      if (bridgeHubChannelDelivered && bridgeHubChannelDelivered.success)
        return 'Arriving at Ethereum'
      if (submitted) return 'Arriving at Bridge Hub'
      return 'Pending'

    case TransferStatus.Complete:
      return 'Transfer completed'

    case TransferStatus.Failed:
      return 'Transfer Failed'

    default: // Should never happen
      return 'Unknown status'
  }
}

export function getTransferStatusToPolkadot(transferResult: ToPolkadotTransferResult) {
  const { status, submitted } = transferResult

  switch (status) {
    case TransferStatus.Pending:
      if (submitted) return 'Arriving at Bridge Hub'
      return 'Pending'

    case TransferStatus.Complete:
      return 'Transfer completed'

    case TransferStatus.Failed:
      return 'Transfer Failed'

    default: // Should never happen
      return 'Unknown'
  }
}

export function isCompletedTransfer(
  transferResult: ToEthereumTransferResult | ToPolkadotTransferResult,
) {
  return (
    transferResult.status === TransferStatus.Complete ||
    transferResult.status === TransferStatus.Failed
  )
}

type StatusValue = 'Normal' | 'Halted' | 'Delayed'
export type BridgeStatus = {
  statusInfo: status.BridgeStatusInfo
  channelStatusInfos: { name: string; status: status.ChannelStatusInfo }[]
  assetHubChannel: status.ChannelStatusInfo
  relayers: AccountInfo[]
  accounts: AccountInfo[]
  summary: {
    toPolkadot: {
      lightClientLatencyIsAcceptable: boolean
      bridgeOperational: boolean
      channelOperational: boolean
    }
    toPolkadotOperatingMode: StatusValue
    toEthereum: {
      bridgeOperational: boolean
      lightClientLatencyIsAcceptable: boolean
    }
    toEthereumOperatingMode: StatusValue
    overallStatus: StatusValue
  }
}

export async function getBridgeStatus(
  context: Context,
  { config }: SnowbridgeEnvironment,
): Promise<BridgeStatus> {
  console.log('Refreshing bridge status.')
  const assetHubSovereignAddress = utils.paraIdToSovereignAccount('sibl', config.ASSET_HUB_PARAID)
  const bridgeHubAgentId = u8aToHex(blake2AsU8a('0x00', 256))

  const [
    bridgeStatusInfo,
    assethub,
    primaryGov,
    secondaryGov,
    assetHubSovereignAccountCodec,
    assetHubAgentAddress,
    bridgeHubAgentAddress,
  ] = await Promise.all([
    status.bridgeStatusInfo(context),
    status.channelStatusInfo(context, utils.paraIdToChannelId(config.ASSET_HUB_PARAID)),
    status.channelStatusInfo(context, config.PRIMARY_GOVERNANCE_CHANNEL_ID),
    status.channelStatusInfo(context, config.SECONDARY_GOVERNANCE_CHANNEL_ID),
    context.polkadot.api.bridgeHub.query.system.account(assetHubSovereignAddress),
    context.ethereum.contracts.gateway.agentOf(
      utils.paraIdToAgentId(context.polkadot.api.bridgeHub.registry, config.ASSET_HUB_PARAID),
    ),
    context.ethereum.contracts.gateway.agentOf(bridgeHubAgentId),
  ])

  const accounts: AccountInfo[] = []
  const assetHubSovereignBalance = BigInt(
    (assetHubSovereignAccountCodec.toPrimitive() as any).data.free,
  )
  accounts.push({
    name: 'Asset Hub Sovereign',
    type: 'substrate',
    account: encodeAddress(assetHubSovereignAddress),
    balance: assetHubSovereignBalance.toString(),
  })

  const [assetHubAgentBalance, bridgeHubAgentBalance, relayers] = await Promise.all([
    context.ethereum.api.getBalance(assetHubAgentAddress),
    context.ethereum.api.getBalance(bridgeHubAgentAddress),
    Promise.all(
      config.RELAYERS.map(async r => {
        let balance = '0'
        switch (r.type) {
          case 'ethereum':
            balance = (await context.ethereum.api.getBalance(r.account)).toString()
            break
          case 'substrate':
            balance = BigInt(
              (
                (
                  await context.polkadot.api.bridgeHub.query.system.account(r.account)
                ).toPrimitive() as any
              ).data.free,
            ).toString()
            break
        }
        return {
          name: r.name,
          account: r.account,
          balance: balance,
          type: r.type,
        }
      }),
    ),
  ])

  accounts.push({
    name: 'Asset Hub Agent',
    type: 'ethereum',
    account: assetHubAgentAddress,
    balance: assetHubAgentBalance.toString(),
  })
  accounts.push({
    name: 'Bridge Hub Agent',
    type: 'ethereum',
    account: bridgeHubAgentAddress,
    balance: bridgeHubAgentBalance.toString(),
  })

  const toPolkadot = {
    lightClientLatencyIsAcceptable:
      bridgeStatusInfo.toPolkadot.latencySeconds < ACCEPTABLE_BRIDGE_LATENCY,
    bridgeOperational:
      bridgeStatusInfo.toPolkadot.operatingMode.outbound === 'Normal' &&
      bridgeStatusInfo.toPolkadot.operatingMode.beacon === 'Normal',
    channelOperational: assethub.toPolkadot.operatingMode.outbound === 'Normal',
  }
  const toPolkadotOperatingMode =
    !toPolkadot.bridgeOperational || !toPolkadot.channelOperational
      ? 'Halted'
      : !toPolkadot.lightClientLatencyIsAcceptable
        ? 'Delayed'
        : 'Normal'

  const toEthereum = {
    bridgeOperational: bridgeStatusInfo.toEthereum.operatingMode.outbound === 'Normal',
    lightClientLatencyIsAcceptable:
      bridgeStatusInfo.toEthereum.latencySeconds < ACCEPTABLE_BRIDGE_LATENCY,
  }
  const toEthereumOperatingMode = !toEthereum.bridgeOperational
    ? 'Halted'
    : !toEthereum.lightClientLatencyIsAcceptable
      ? 'Delayed'
      : 'Normal'

  let overallStatus: StatusValue = toEthereumOperatingMode
  if (toEthereumOperatingMode === 'Normal') {
    overallStatus = toPolkadotOperatingMode
  }

  return {
    summary: {
      toPolkadot,
      toPolkadotOperatingMode,
      toEthereum,
      toEthereumOperatingMode,
      overallStatus,
    },
    statusInfo: bridgeStatusInfo,
    assetHubChannel: assethub,
    channelStatusInfos: [
      { name: 'Asset Hub', status: assethub },
      { name: 'Primary Governance', status: primaryGov },
      { name: 'Secondary Governance', status: secondaryGov },
    ],
    relayers,
    accounts,
  }
}

export function getErrorMessage(err: any) {
  let message = 'Unknown error'
  if (err instanceof Error) {
    message = err.message
  }
  console.error(message, err)
  return message
}
