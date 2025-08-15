import type { CompletedTransferV0, CompletedTransferV1, FeeDetails } from '@/models/transfer'
import { STORE_VERSIONS } from './constants'

// biome-ignore lint/suspicious/noExplicitAny: any
export const migrateCompletedTransfers = (persistedState: any, version: number) => {
  if (version === STORE_VERSIONS.COMPLETED_TRANSFERS) return persistedState

  if (version === 0) {
    const oldTransfers = persistedState as { completedTransfers: CompletedTransferV0[] }

    const migratedTransfers = oldTransfers.completedTransfers.map(transfer => ({
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

  if (version === 1) {
    const oldTransfers = persistedState as { completedTransfers: CompletedTransferV1[] }

    const migratedTransfers = oldTransfers.completedTransfers.map(transfer => {
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
        id: transfer.id,
        result: transfer.result,
        sourceChain: transfer.sourceChain,
        destChain: transfer.destChain,
        sender: transfer.sender,
        recipient: transfer.recipient,
        date: transfer.date,
        minTokenRecieved: transfer.minTokenRecieved,
        minTokenRecievedValue: transfer.minTokenRecievedValue,
        explorerLink: transfer.explorerLink,
        errors: transfer.errors,
        sourceToken: transfer.sourceToken,
        destinationToken: transfer.destinationToken,
        sourceTokenUSDValue: transfer.sourceTokenUSDValue,
        destinationTokenUSDValue: transfer.destinationTokenUSDValue,
        sourceAmount: transfer.sourceAmount,
        destinationAmount: transfer.destinationAmount,

        // V1 Migrations
        fees,
      }
    })

    return { completedTransfers: migratedTransfers }
  }

  console.warn(`Unknown completed transfers version ${version}, resetting to initial state`)
  return { completedTransfers: [] }
}
