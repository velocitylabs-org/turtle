import { environment } from '@snowbridge/api'
import { OngoingTransfers, StoredTransfer, TxTrackingResult } from '@/models/transfer'
import { trackFromParachainTx } from './subscan'
import { FromParachainTrackingResult } from '@/models/subscan'
import { TransferStatus } from '@snowbridge/api/dist/history'
import { trackFromEthTx } from './snowbridge'
import { FromAhToEthTrackingResult, FromEthTrackingResult } from '@/models/snowbridge'

export const trackTransfers = async (
  env: environment.SnowbridgeEnvironment,
  ongoingTransfers: OngoingTransfers,
) => {
  const transfers: TxTrackingResult[] = []

  if (ongoingTransfers.toPolkadot.length) {
    const ethToParaTx = await trackFromEthTx(env)
    console.log('From Eth To Polkadot transfers:', ethToParaTx.length)
    transfers.push(...ethToParaTx)
  }

  if (ongoingTransfers.toEthereum.length) {
    // const ahToEthereumTx = await trackFromAhToEthTx(env)
    const ahToEthereumTx = await trackFromParachainTx(env, ongoingTransfers.toEthereum)
    console.log('From AH To Ethereum transfer:', ahToEthereumTx.length)
    transfers.push(...ahToEthereumTx)
  }

  // Keep this until we can test & check tracking process for from Para to AH transfers
  if (ongoingTransfers.withinPolkadot.length) {
    const parachainToAhTx = await trackFromParachainTx(env, ongoingTransfers.withinPolkadot)
    console.log('From Parachain To AH transfer:', parachainToAhTx.length)
    transfers.push(...parachainToAhTx)
  }

  return transfers.sort((a, b) => getTransferTimestamp(b) - getTransferTimestamp(a))
}

/**
 * Retrieves the transfer timestamp.
 * A transfer result from the Snowbridge API includes 'info' in the transferResult and covers:
 * both Eth to Parachain and AH to Eth transfer directions.
 *
 * The second condition returns the timestamp from an AT API transfer result.
 * @param txTrackingResult - A transfer tracking response from the Snowbridge API or Subscan API.
 * @returns - The transfer timestamp in milliseconds.
 */
const getTransferTimestamp = (txTrackingResult: TxTrackingResult) =>
  'info' in txTrackingResult
    ? txTrackingResult.info.when.getTime()
    : txTrackingResult.originBlockTimestamp

/**
 * Provides the current transfer status based on the transfer direction.
 *
 * If a result includes 'info' in the transferResult and info.destinationParachain is undefined:
 * The transfer direction is from AH to Eth (from Snowbridge API)
 *
 * If a result includes 'destEventIndex' in the transferResult and "info" is undefined in destinationParachain:
 * The transfer direction is from a Parachain to AH (from AT API)
 *
 * Default case return get transfer status for a transfer from Eth to a Parachain/AH
 *
 * @param transferResult - A transfer tracking response from the Snowbridge API or Subscan API.
 * @returns - the transfer status
 */
export function getTransferStatus(transferResult: TxTrackingResult) {
  // Checks if the tracked AH to Ethereum transfer comes from Snowbridge API.
  const isAhToEthTransfer =
    'info' in transferResult && transferResult.info.destinationParachain == undefined

  // Checks if the tracked XCM transfer comes from Subscan API.
  const isXCMTransfer = 'destEventIndex' in transferResult && !('info' in transferResult)

  if (isAhToEthTransfer)
    return getTransferStatusFromParachain(transferResult as FromAhToEthTrackingResult)
  if (isXCMTransfer)
    return getTransferStatusFromParachain(transferResult as FromParachainTrackingResult)
  // Retrieves the status of a transfer from Eth to a Parachain/AH (from Snowbridge API)
  return getTransferStatusToPolkadot(transferResult as FromEthTrackingResult)
}

/**
 * Retrieves the status of a transfer from:
 * The AH Parachain to Eth (initiated and tracked with Snowbridge API)
 * A Parachain to AH (initiated with AT API and tracked with Subscan API)
 *
 * @param transferResult - The transfer tracking response from either the Subscan API (for Parachain to AH transfers) or the Snowbridge API (for AH to Ethereum transfers).
 * @returns - the transfer status
 */
export function getTransferStatusFromParachain(
  transferResult: FromAhToEthTrackingResult | FromParachainTrackingResult,
) {
  /** Bridge Hub Channel Message Delivered */
  const isBHChannelMsgDeliveredInSnowbridgeRes =
    'bridgeHubChannelDelivered' in transferResult &&
    transferResult.bridgeHubChannelDelivered?.success
  /** Destination Event Index available */
  const isDestEventIdxInSubscanXCMRes =
    'destEventIndex' in transferResult && transferResult.destEventIndex.length > 0
  /** Transfer just submitted from AH */
  const isTransferSubmittedInSnowbridgeRes = 'submitted' in transferResult

  switch (transferResult.status) {
    case TransferStatus.Pending:
      if (isBHChannelMsgDeliveredInSnowbridgeRes || isDestEventIdxInSubscanXCMRes)
        return 'Arriving at Ethereum'
      if (
        isTransferSubmittedInSnowbridgeRes ||
        !transferResult.destEventIndex ||
        !isDestEventIdxInSubscanXCMRes
      )
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

/**
 * Retrieves the status of a transfer from:
 * Eth to a Parachain/AH (initiated and tracked w Snowbridge API)
 *
 * @param txTrackingResult - The transfer tracking response for an Eth to Parachain/AH transfer from the Snowbridge API.
 * @returns - the transfer status
 */
export const getTransferStatusToPolkadot = (txTrackingResult: FromEthTrackingResult) => {
  const { status, submitted } = txTrackingResult

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

/**
 * Verifies if a transfer is completed
 *
 * @param txTrackingResult - The transfer tracking response from the Snowbridge API, Subscan API, or other explorer services.
 * @returns - `true` if the transfer has either completed or failed, otherwise `false` if it is still pending.
 */
export const isCompletedTransfer = (txTrackingResult: TxTrackingResult) => {
  return (
    txTrackingResult.status === TransferStatus.Complete ||
    txTrackingResult.status === TransferStatus.Failed
  )
}

/**
 * Finds a matching ongoingTransfer stored in the user's local storage within the tracking explorer/history transfer list (Subscan, Snowbridge history, etc.).
 * The match relies either on the Snowbridge API or the AT API, and depends on the transfer direction.
 * - Snowbridge API:
 *   - Used for both Eth to Parachain and AH to Ethereum transfers.
 *   - Ongoing transfers executed via the Snowbridge API contain the 'submitted' field in their `transferResult`.
 * - AT API:
 *   - Used for transfers in the XCM direction.
 *
 * @param transfers - The list of tracked transfers from the explorer's history (Subscan, Snowbridge history, etc.).
 * @param ongoingTransfer - The ongoing transfer stored in the user's local storage.
 * @returns - The matching transfer from the explorer history list, or `undefined` if no match is found.
 */
export const findMatchingTransfer = (
  transfers: TxTrackingResult[],
  ongoingTransfer: StoredTransfer,
) =>
  transfers.find(transfer =>
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
