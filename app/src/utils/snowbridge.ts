import { AlchemyProvider } from 'ethers'
import { environment, subscan, history } from '@snowbridge/api'
import {
  ToEthereumTransferResult,
  ToPolkadotTransferResult,
  TransferStatus,
} from '@snowbridge/api/dist/history'
import { BeefyClient__factory, IGateway__factory } from '@snowbridge/contract-types'
import { OngoingTransfers } from '@/models/transfer'
import { SubscanXCMTransferResult } from '@/models/subscan'

import { trackXcmTransfer } from './subscan'

export const SKIP_LIGHT_CLIENT_UPDATES = true
export const HISTORY_IN_SECONDS = 60 * 60 * 24 * 2 // 2 days
export const ETHEREUM_BLOCK_TIME_SECONDS = 12
export const ACCEPTABLE_BRIDGE_LATENCY = 28800 // 8 hours

export async function getTransferHistory(
  env: environment.SnowbridgeEnvironment,
  ongoingTransfers: OngoingTransfers,
  skipLightClientUpdates = SKIP_LIGHT_CLIENT_UPDATES,
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

  const transfers: (
    | ToEthereumTransferResult
    | ToPolkadotTransferResult
    | SubscanXCMTransferResult
  )[] = []

  if (ongoingTransfers.toEthereum.fromAssetHub.length) {
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
    console.log('From AH To Ethereum transfers:', toEthereum.length)
    transfers.push(...toEthereum)

    // const fromAHTransfer = await trackXcmTransfer(
    //   relaychainScan,
    //   ongoingTransfers.toEthereum.fromAssetHub,
    // )
    // console.log('Find from AH To Ethereum transfer:', fromAHTransfer)
  }

  if (ongoingTransfers.toEthereum.fromParachain.length) {
    const fromParachainTransfer = await trackXcmTransfer(
      relaychainScan,
      ongoingTransfers.toEthereum.fromParachain,
    )
    console.log('From Parachain/AH To Ethereum transfer:', fromParachainTransfer)
    transfers.push(...fromParachainTransfer)
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
    console.log('From ETH To Polkadot transfers:', toPolkadot.length)
    transfers.push(...toPolkadot)
  }

  transfers.sort((a, b) =>
    'info' in b
      ? b.info.when.getTime()
      : b.originBlockTimestamp - ('info' in a ? a.info.when.getTime() : a.originBlockTimestamp),
  )
  return transfers.filter(t => t.status === TransferStatus.Pending)
}

export interface AccountInfo {
  name: string
  type: 'ethereum' | 'substrate'
  account: string
  balance: string
}

export function getTransferStatus(
  transferResult: ToEthereumTransferResult | ToPolkadotTransferResult | SubscanXCMTransferResult,
) {
  if ('info' in transferResult && transferResult.info.destinationParachain == undefined)
    return getTransferStatusToEthereum(transferResult as ToEthereumTransferResult)
  else if ('destEventIndex' in transferResult && !('info' in transferResult)) {
    return getTransferStatusToEthereum(transferResult as SubscanXCMTransferResult)
  } else {
    return getTransferStatusToPolkadot(transferResult as ToPolkadotTransferResult)
  }
}

export function getTransferStatusToEthereum(
  transferResult: ToEthereumTransferResult | SubscanXCMTransferResult,
) {
  const { status } = transferResult

  switch (status) {
    case TransferStatus.Pending:
      if (
        ('bridgeHubChannelDelivered' in transferResult &&
          transferResult.bridgeHubChannelDelivered?.success) ||
        ('destEventIndex' in transferResult && transferResult.destEventIndex.length > 0)
      )
        return 'Arriving at Ethereum'
      if (
        'submitted' in transferResult ||
        !transferResult.destEventIndex ||
        ('destEventIndex' in transferResult && transferResult.destEventIndex.length === 0)
      )
        return 'Arriving at Bridge Hub'
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
  transferResult: ToEthereumTransferResult | ToPolkadotTransferResult | SubscanXCMTransferResult,
) {
  return (
    transferResult.status === TransferStatus.Complete ||
    transferResult.status === TransferStatus.Failed
  )
}

export function getErrorMessage(err: unknown) {
  let message = 'Unknown error'
  if (err instanceof Error) {
    message = err.message
  }
  console.error(message, err)
  return message
}
