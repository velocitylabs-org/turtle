import { environment } from '@snowbridge/api'
import { OngoingTransfers, StoredTransfer, TxTrackingResult } from '@/models/transfer'
import { trackXcm } from './subscan'
import { FromParachainTrackingResult } from '@/models/subscan'
import { TransferStatus } from '@snowbridge/api/dist/history'
import { historyV2 as history } from '@snowbridge/api'
import { FromAhToEthTrackingResult, FromEthTrackingResult } from '@/models/snowbridge'
import { resolveDirection } from '@/services/transfer'

export const trackTransfers = async (
  env: environment.SnowbridgeEnvironment,
  ongoingTransfers: OngoingTransfers,
) => {
  const transfers: TxTrackingResult[] = []
  const { toPolkadot, toEthereum, withinPolkadot } = ongoingTransfers

  for (const transfer of toPolkadot) {
    const tx = await history.toPolkadotTransferById(transfer.id) // must be {messageId_eq: "${id}", OR: {txHash_eq: "${id}"}
    if (tx) transfers.push(tx)
  }

  for (const transfer of toEthereum) {
    const tx = await history.toEthereumTransferById(
      transfer.parachainMessageId ? transfer.parachainMessageId : transfer.id,
    )
    if (tx) transfers.push(tx)
  }

  // Keep as back-up in case Ocelloids does not support a transfer path
  if (withinPolkadot.length) {
    const xcmTx = await trackXcm(env, withinPolkadot)
    console.log('Whithin Polkadot transfers:', xcmTx.length)
    transfers.push(...xcmTx)
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
  const isBHChannelMsgDelivered =
    'bridgeHubChannelDelivered' in transferResult &&
    transferResult.bridgeHubChannelDelivered?.success

  const isBHXcmDelivered =
    'bridgeHubXcmDelivered' in transferResult && transferResult.bridgeHubXcmDelivered?.success
  /** Destination chain is Ethereum in XCM transfer*/
  const isDestChainEthereum =
    'destChain' in transferResult && transferResult.destChain === 'ethereum'
  /** Transfer just submitted from AH */
  const isBridgeTransferSubmitted = 'submitted' in transferResult

  switch (transferResult.status) {
    case TransferStatus.Pending:
      if (isBHChannelMsgDelivered || isBHXcmDelivered || isDestChainEthereum)
        return 'Arriving at Ethereum'
      if (isBridgeTransferSubmitted) return 'Arriving at Bridge Hub'
      // Default when the above conditions are not met
      return 'Pending'

    case TransferStatus.Complete:
      return 'Completed'

    case TransferStatus.Failed:
      return 'Failed'

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
      return 'Completed'

    case TransferStatus.Failed:
      return 'Failed'

    default: // Should never happen
      return 'Unknown status'
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
  transfers.find(transfer => {
    if ('submitted' in transfer) {
      if (resolveDirection(ongoingTransfer.sourceChain, ongoingTransfer.destChain) === 'ToEthereum')
        return transfer.id === ongoingTransfer.parachainMessageId
      return transfer.id === ongoingTransfer.id
    }
    if (ongoingTransfer.crossChainMessageHash)
      return transfer.messageHash === ongoingTransfer.crossChainMessageHash
    if (ongoingTransfer.sourceChainExtrinsicIndex)
      return transfer.extrinsicIndex === ongoingTransfer.sourceChainExtrinsicIndex

    return undefined
  })

export function getErrorMessage(err: unknown) {
  let message = 'Unknown error'
  if (err instanceof Error) message = err.message
  console.error(message, err)
  return message
}
