import { AlchemyProvider } from 'ethers'
import { environment, subscan, history, status } from '@snowbridge/api'
import {
  ToEthereumTransferResult,
  ToPolkadotTransferResult,
  TransferStatus,
} from '@snowbridge/api/dist/history'
import { BeefyClient__factory, IGateway__factory } from '@snowbridge/contract-types'
import { PendingTransfers } from '@/models/transfer'

export const SKIP_LIGHT_CLIENT_UPDATES = true
export const HISTORY_IN_SECONDS = 60 * 60 * 24 * 7 * 2 // 2 Weeks
export const ETHEREUM_BLOCK_TIME_SECONDS = 12
export const ACCEPTABLE_BRIDGE_LATENCY = 28800 // 8 hours

export async function getTransferHistory(
  env: environment.SnowbridgeEnvironment,
  ongoingTransfers: PendingTransfers,
  skipLightClientUpdates: boolean,
  historyInSeconds = HISTORY_IN_SECONDS,
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

  let transfers: (ToEthereumTransferResult | ToPolkadotTransferResult)[] = []

  if (ongoingTransfers.toEthereum.length) {
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
    transfers.push(...toEthereum)
  }

  if (ongoingTransfers.toPolkadot.length) {
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
    transfers.push(...toPolkadot)
  }

  transfers.sort((a, b) => b.info.when.getTime() - a.info.when.getTime())
  // return transfers.filter((t) => t.status === TransferStatus.Pending)
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

export function getErrorMessage(err: unknown) {
  let message = 'Unknown error'
  if (err instanceof Error) {
    message = err.message
  }
  console.error(message, err)
  return message
}
