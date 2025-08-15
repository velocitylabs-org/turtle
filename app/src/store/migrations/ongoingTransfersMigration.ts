import type { FeeDetails, StoredTransferV0, StoredTransferV1 } from '@/models/transfer'
import { STORE_VERSIONS } from './constants'

// biome-ignore lint/suspicious/noExplicitAny: any
export const migrateOngoingTransfers = (persistedState: any, version: number) => {
  if (version === STORE_VERSIONS.ONGOING_TRANSFERS) return persistedState

  if (version === 0) {
    const oldTransfers = persistedState as { transfers: StoredTransferV0[] }

    const migratedTransfers = oldTransfers.transfers.map(transfer => ({
      // Copy all fields from RawTransfer
      id: transfer.id,
      sourceChain: transfer.sourceChain,
      destChain: transfer.destChain,
      sender: transfer.sender,
      recipient: transfer.recipient,
      date: transfer.date,
      crossChainMessageHash: transfer.crossChainMessageHash,
      parachainMessageId: transfer.parachainMessageId,
      sourceChainExtrinsicIndex: transfer.sourceChainExtrinsicIndex,
      fees: transfer.fees,
      bridgingFee: transfer.bridgingFee,
      sendResult: transfer.sendResult,
      uniqueTrackingId: transfer.uniqueTrackingId,
      status: transfer.status,
      finalizedAt: transfer.finalizedAt,

      // V0 Migrations
      sourceToken: transfer.token,
      sourceAmount: transfer.amount,
      sourceTokenUSDValue: transfer.tokenUSDValue,
      swapInformation: undefined,
    }))

    return { transfers: migratedTransfers }
  }

  if (version === 1) {
    const oldTransfers = persistedState as { transfers: StoredTransferV1[] }

    const migratedTransfers = oldTransfers.transfers.map(transfer => {
      const fees: FeeDetails[] = []

      // Convert regular fees to FeeDetails array
      if (transfer.fees) {
        fees.push({
          title: 'Execution fees',
          chain: transfer.sourceChain,
          amount: transfer.fees,
          sufficient: true,
        })
      }

      // Convert bridging fee to FeeDetails if it exists
      if (transfer.bridgingFee) {
        fees.push({
          title: 'Bridging fees',
          chain: transfer.sourceChain,
          amount: transfer.bridgingFee,
          sufficient: true,
        })
      }

      return {
        // Copy all fields from RawTransfer
        id: transfer.id,
        sourceChain: transfer.sourceChain,
        destChain: transfer.destChain,
        sender: transfer.sender,
        recipient: transfer.recipient,
        date: transfer.date,
        crossChainMessageHash: transfer.crossChainMessageHash,
        parachainMessageId: transfer.parachainMessageId,
        sourceChainExtrinsicIndex: transfer.sourceChainExtrinsicIndex,
        sendResult: transfer.sendResult,
        uniqueTrackingId: transfer.uniqueTrackingId,
        status: transfer.status,
        finalizedAt: transfer.finalizedAt,
        sourceToken: transfer.sourceToken,
        destinationToken: transfer.destinationToken,
        sourceAmount: transfer.sourceAmount,
        destinationAmount: transfer.destinationAmount,
        sourceTokenUSDValue: transfer.sourceTokenUSDValue,
        destinationTokenUSDValue: transfer.destinationTokenUSDValue,
        swapInformation: transfer.swapInformation,

        // V1 Migrations
        fees,
      }
    })

    return { transfers: migratedTransfers }
  }

  console.warn(`Unknown ongoing transfers version ${version}, resetting to initial state`)
  return { transfers: [] }
}
