import { type environment, historyV2 as history } from '@snowbridge/api'
import { TransferStatus } from '@snowbridge/api/dist/history'
import type { FromEthTrackingResult, FromParaToEthTrackingResult } from '@/models/snowbridge'
import type {
  OngoingTransfers,
  OngoingTransferWithDirection,
  StoredTransfer,
  TxTrackingResult,
} from '@/models/transfer'
import { Direction, resolveDirection } from './transfer'

export const trackTransfers = async (env: environment.SnowbridgeEnvironment, ongoingTransfers: OngoingTransfers) => {
  const transfers: TxTrackingResult[] = []
  const { toPolkadot, toEthereum } = ongoingTransfers

  for (const transfer of toPolkadot) {
    const tx = await history.toPolkadotTransferById(env.config.GRAPHQL_API_URL, transfer.id)
    if (tx) transfers.push(tx)
  }

  for (const transfer of toEthereum) {
    const tx = await history.toEthereumTransferById(
      env.config.GRAPHQL_API_URL,
      transfer.parachainMessageId ? transfer.parachainMessageId : transfer.id,
    )
    if (tx) transfers.push(tx)
  }

  return transfers.sort((a, b) => getTransferTimestamp(b) - getTransferTimestamp(a))
}

/**
 * Retrieves the transfer timestamp.
 * A transfer result from the Snowbridge API includes 'info' in the transferResult and covers:
 * both Eth to Parachain and AH to Eth transfer directions.
 *
 * The second condition returns the timestamp from an AT API transfer result.
 * @param txTrackingResult - A transfer tracking response from the Snowbridge API.
 * @returns - The transfer timestamp in milliseconds.
 */
const getTransferTimestamp = (txTrackingResult: TxTrackingResult) => txTrackingResult.info.when.getTime()

/**
 * Finds a matching ongoingTransfer stored in the user's local storage within the tracking explorer/history transfer list (Subscan, Snowbridge history, etc.).
 *
 * @param transfers - The list of tracked transfers from the explorer's history (Subscan, Snowbridge history, etc.).
 * @param ongoingTransfer - The ongoing transfer stored in the user's local storage.
 * @returns - The matching transfer from the explorer history list, or `undefined` if no match is found.
 */
export const findMatchingTransfer = (transfers: TxTrackingResult[], ongoingTransfer: StoredTransfer) =>
  transfers.find(transfer => {
    if (resolveDirection(ongoingTransfer.sourceChain, ongoingTransfer.destChain) === 'ToEthereum') {
      return (
        transfer.id === ongoingTransfer.parachainMessageId ||
        ('extrinsic_hash' in transfer.submitted && transfer.submitted.extrinsic_hash === ongoingTransfer.id)
      )
    } else {
      return (
        transfer.id === ongoingTransfer.id ||
        ('transactionHash' in transfer.submitted && transfer.submitted.transactionHash === ongoingTransfer.id)
      )
    }
  })

/**
 * Provides the current transfer status based on the transfer direction.
 *
 * If a result includes 'info' in the transferResult and info.destinationParachain is undefined:
 * The transfer direction is from a Parachain to Eth (from Snowbridge API)
 *
 * Default case return get transfer status for a transfer from Eth to a Parachain
 *
 * @param transferResult - A transfer tracking response from the Snowbridge API.
 * @returns - the transfer status
 */
export function getTransferStatus(transferResult: TxTrackingResult) {
  // Checks if the tracked AH to Ethereum transfer comes from Snowbridge API.
  const isParachainToEthTransfer = 'info' in transferResult && transferResult.info.destinationParachain === undefined

  if (isParachainToEthTransfer) return getTransferStatusFromParachain(transferResult as FromParaToEthTrackingResult)
  // Retrieves the status of a transfer from Eth to a Parachain/AH (from Snowbridge API)
  return getTransferStatusToPolkadot(transferResult as FromEthTrackingResult)
}

/**
 * Retrieves the status of a transfer from:
 * The Parachain to Eth (initiated and tracked w Snowbridge API)
 *
 * @param transferResult - The transfer tracking response from the Snowbridge API.
 * @returns - the transfer status
 */
export function getTransferStatusFromParachain(transferResult: FromParaToEthTrackingResult) {
  /** Bridge Hub Channel Message Delivered */
  const isBHChannelMsgDelivered =
    'bridgeHubChannelDelivered' in transferResult && transferResult.bridgeHubChannelDelivered?.success

  /** Transfer just submitted from AH */
  const isBridgeTransferSubmitted = 'submitted' in transferResult

  switch (transferResult.status) {
    case TransferStatus.Pending:
      if (isBHChannelMsgDelivered) return 'Arriving at Ethereum'
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
 * Eth to a Parachain (initiated and tracked w Snowbridge API)
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
  return txTrackingResult.status === TransferStatus.Complete || txTrackingResult.status === TransferStatus.Failed
}

const formatTransfersWithDirection = (ongoingTransfers: StoredTransfer[]): OngoingTransferWithDirection[] => {
  return ongoingTransfers
    .map(t => {
      const direction = resolveDirection(t.sourceChain, t.destChain)
      return {
        id: t.id,
        sourceChain: t.sourceChain,
        destChain: t.destChain,
        sender: t.sender,
        recipient: t.recipient,
        sourceToken: t.sourceToken,
        destinationToken: t.destinationToken,
        date: t.date,
        direction,
        ...(t.crossChainMessageHash && { crossChainMessageHash: t.crossChainMessageHash }),
        ...(t.parachainMessageId && { parachainMessageId: t.parachainMessageId }),
        ...(t.sourceChainExtrinsicIndex && {
          sourceChainExtrinsicIndex: t.sourceChainExtrinsicIndex,
        }),
      }
      // return {
      //   ...t,
      //   direction
      // }
    })
    .filter(t => t.direction !== Direction.WithinPolkadot)
}

export const getFormattedOngoingTransfers = (ongoingTransfers: StoredTransfer[]) => {
  const transfers: OngoingTransfers = {
    toEthereum: [],
    toPolkadot: [],
  }

  const formattedTransfers = formatTransfersWithDirection(ongoingTransfers)
  if (!formattedTransfers.length) return transfers

  formattedTransfers.forEach(transfer => {
    switch (transfer.direction) {
      case Direction.ToEthereum: {
        transfers.toEthereum.push(transfer)
        break
      }
      case Direction.ToPolkadot: {
        transfers.toPolkadot.push(transfer)
        break
      }
      default:
        throw new Error('Direction not supported')
    }
  })

  return transfers
}
