import type { CompletedTransferV0 } from '@/models/transfer'
import { STORE_VERSIONS } from './constants'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const migrateCompletedTransfers = (persistedState: any, version: number) => {
  if (version === STORE_VERSIONS.COMPLETED_TRANSFERS) return persistedState

  if (version === 0) {
    const oldTransfers = persistedState as { completedTransfers: CompletedTransferV0[] }

    const migratedTransfers = oldTransfers.completedTransfers.map((transfer) => ({
      id: transfer.id,
      result: transfer.result,
      sourceChain: transfer.sourceChain,
      destChain: transfer.destChain,
      sender: transfer.sender,
      recipient: transfer.recipient,
      date: transfer.date,
      fees: transfer.fees,
      bridgingFee: transfer.bridgingFee,
      minTokenRecieved: transfer.minTokenRecieved,
      minTokenRecievedValue: transfer.minTokenRecievedValue,
      explorerLink: transfer.explorerLink,
      errors: transfer.errors,

      // V0 Migrations
      sourceToken: transfer.token,
      sourceTokenUSDValue: transfer.tokenUSDValue,
      sourceAmount: transfer.amount,
    }))

    return { completedTransfers: migratedTransfers }
  }

  console.warn(`Unknown completed transfers version ${version}, resetting to initial state`)
  return { completedTransfers: [] }
}
