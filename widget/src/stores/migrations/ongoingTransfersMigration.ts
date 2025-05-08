import { StoredTransferV0 } from '@/models/transfer'
import { STORE_VERSIONS } from './constants'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      environment: transfer.environment,
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

  console.warn(`Unknown ongoing transfers version ${version}, resetting to initial state`)
  return { transfers: [] }
}
