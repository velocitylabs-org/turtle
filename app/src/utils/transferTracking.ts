import { environment } from '@snowbridge/api'
import { OngoingTransfers, StoredTransfer } from '@/models/transfer'
import { trackFromParachainTx } from './subscan'
import { SubscanXCMTransferResult } from '@/models/subscan'
import { ToPolkadotTransferResult, TransferStatus } from '@snowbridge/api/dist/history'
import { trackFromEthTx } from './snowbridge'

export const trackTransfers = async (
  env: environment.SnowbridgeEnvironment,
  ongoingTransfers: OngoingTransfers,
) => {
  console.log('Fetching transfer history.')
  const transfers: (ToPolkadotTransferResult | SubscanXCMTransferResult)[] = []

  if (ongoingTransfers.toPolkadot.length) {
    const ethToParaTx = await trackFromEthTx(env)
    console.log('From Eth To Polkadot transfers:', ethToParaTx.length)
    transfers.push(...ethToParaTx)
  }

  if (ongoingTransfers.toEthereum.fromAssetHub.length) {
    const ahToEthereumTx = await trackFromParachainTx(env, ongoingTransfers.toEthereum.fromAssetHub)
    console.log('From AH To Ethereum transfer:', ahToEthereumTx)
    transfers.push(...ahToEthereumTx)
  }

  // Keep this until we can test tracking from Para to AH
  if (ongoingTransfers.toEthereum.fromParachain.length) {
    // => TODO: need to rename toEthereum => toAH/refactor object
    const parachainToAhTx = await trackFromParachainTx(
      env,
      ongoingTransfers.toEthereum.fromParachain,
    )
    console.log('From Parachain To AH transfer:', parachainToAhTx)
    transfers.push(...parachainToAhTx)
  }

  return transfers.sort((a, b) => getTransferTimestamp(b) - getTransferTimestamp(a))
}

const getTransferTimestamp = (
  transferResult: ToPolkadotTransferResult | SubscanXCMTransferResult,
) =>
  /** Get transfer timestamp from or to prachain tx */
  'info' in transferResult
    ? transferResult.info.when.getTime()
    : transferResult.originBlockTimestamp

export function getTransferStatus(
  transferResult: ToPolkadotTransferResult | SubscanXCMTransferResult,
) {
  /**  Checks if the transfer from or to prachain tx*/
  const isFromParachainTx = 'destEventIndex' in transferResult && !('info' in transferResult)
  /** Retrieves the status of a transfer from a Parachain to AH or ETH */
  if (isFromParachainTx)
    return getTransferStatusFromParachain(transferResult as SubscanXCMTransferResult)
  /** Retrieves the status of a transfer from Eth to a Parachain/AH */
  return getTransferStatusToPolkadot(transferResult as ToPolkadotTransferResult)
}

export function getTransferStatusFromParachain(transferResult: SubscanXCMTransferResult) {
  /** Destination Event Index available */
  const isDestEventIdxInSubscanXCMRes =
    'destEventIndex' in transferResult && transferResult.destEventIndex.length > 0

  switch (transferResult.status) {
    case TransferStatus.Pending:
      /** Bridge Hub Channel Message Delivered */
      if (isDestEventIdxInSubscanXCMRes) return 'Arriving at Ethereum'
      if (!transferResult.destEventIndex || !isDestEventIdxInSubscanXCMRes)
        return 'Arriving at Bridge Hub'
      // Default when the above conditions are not met
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
  transferResult: ToPolkadotTransferResult | SubscanXCMTransferResult,
) {
  return (
    transferResult.status === TransferStatus.Complete ||
    transferResult.status === TransferStatus.Failed
  )
}

export const findMatchingTransfer = (
  transfers: (ToPolkadotTransferResult | SubscanXCMTransferResult)[],
  ongoingTransfer: StoredTransfer,
) =>
  transfers.find(transfer =>
    // Transfer direction is from Eth to Parachain/AH
    'submitted' in transfer
      ? transfer.id === ongoingTransfer.id
      : transfer.messageHash === ongoingTransfer.crossChainMessageHash,
  )

export function getErrorMessage(err: unknown) {
  let message = 'Unknown error'
  if (err instanceof Error) message = err.message
  console.error(message, err)
  return message
}
