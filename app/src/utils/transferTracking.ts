import { environment } from '@snowbridge/api'
import { OngoingTransfers, StoredTransfer, TxTrackingResult } from '@/models/transfer'
import { trackFromParachainTx } from './subscan'
import { FromParachainTrackingRes } from '@/models/subscan'
import { TransferStatus } from '@snowbridge/api/dist/history'
import { trackFromEthTx } from './snowbridge'
import { FromEthTrackingRes } from '@/models/snowbridge'

export const trackTransfers = async (
  env: environment.SnowbridgeEnvironment,
  ongoingTransfers: OngoingTransfers,
) => {
  console.log('Fetching transfer history.')
  const transfers: TxTrackingResult[] = []

  if (ongoingTransfers.toPolkadot.length) {
    const ethToParaTx = await trackFromEthTx(env)
    console.log('From Eth To Polkadot transfers:', ethToParaTx.length)
    transfers.push(...ethToParaTx)
  }

  if (ongoingTransfers.toEthereum.length) {
    const ahToEthereumTx = await trackFromParachainTx(env, ongoingTransfers.toEthereum)
    console.log('From AH To Ethereum transfer:', ahToEthereumTx.length)
    transfers.push(...ahToEthereumTx)
  }

  // Keep this until we can test & check tracking process for from Para to AH transfers
  if (ongoingTransfers.withinPolkadot.length) {
    const parachainToAhTx = await trackFromParachainTx(
      env,
      ongoingTransfers.withinPolkadot,
    )
    console.log('From Parachain To AH transfer:', parachainToAhTx.length)
    transfers.push(...parachainToAhTx)
  }

  return transfers.sort((a, b) => getTransferTimestamp(b) - getTransferTimestamp(a))
}

const getTransferTimestamp = (transferResult: TxTrackingResult) =>
  /** Get transfer timestamp from or to prachain tx */
  'info' in transferResult
    ? transferResult.info.when.getTime()
    : transferResult.originBlockTimestamp

export function getTransferStatus(transferResult: TxTrackingResult) {
  /**  Checks if the transfer from or to prachain tx*/
  const isFromParachainTx = 'destEventIndex' in transferResult && !('info' in transferResult)
  /** Retrieves the status of a transfer from a Parachain to AH or ETH */
  if (isFromParachainTx) return getTransferStatusFromParachain(transferResult)
  /** Retrieves the status of a transfer from Eth to a Parachain/AH */
  return getTransferStatusToPolkadot(transferResult)
}

export function getTransferStatusFromParachain(transferResult: FromParachainTrackingRes) {
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

export function getTransferStatusToPolkadot(transferResult: FromEthTrackingRes) {
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

export function isCompletedTransfer(transferResult: TxTrackingResult) {
  return (
    transferResult.status === TransferStatus.Complete ||
    transferResult.status === TransferStatus.Failed
  )
}

export const findMatchingTransfer = (
  transfers: TxTrackingResult[],
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
