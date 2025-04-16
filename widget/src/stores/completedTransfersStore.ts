import { AmountInfo, CompletedTransfer } from '@/models/transfer'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface CompletedTxState {
  completedTransfers: CompletedTransfer[]
  addCompletedTransfer: (completedTransfer: CompletedTransfer) => void
}

const serializeFeeAmount = (fees: AmountInfo): AmountInfo => {
  return {
    ...fees,
    amount: fees.amount.toString(),
  }
}

// const currentStoreVersion = 1

export const useCompletedTransfersStore = create<CompletedTxState>()(
  persist(
    set => ({
      completedTransfers: [],

      addCompletedTransfer: newCompletedTransfer => {
        if (!newCompletedTransfer) return

        // needed to not run into bigint persistence issues
        const persistableTransfer = {
          ...newCompletedTransfer,
          fees: serializeFeeAmount(newCompletedTransfer.fees),
          ...(newCompletedTransfer.bridgingFee && {
            bridgingFee: serializeFeeAmount(newCompletedTransfer.bridgingFee),
          }),
        }

        set(state => {
          // Check if the newCompletedTransfer already exists in the local store
          const transferExists = state.completedTransfers.some(
            transfer => transfer.id === persistableTransfer.id,
          )

          if (transferExists) return { completedTransfers: state.completedTransfers }

          return {
            completedTransfers: [...state.completedTransfers, persistableTransfer],
          }
        })
      },
    }),
    {
      name: 'turtle-completed-transactions',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({ completedTransfers: state.completedTransfers }),
      // version: currentStoreVersion,
      // migrate: (persistedState, version) => {
      //   if (version === currentStoreVersion) return persistedState

      //   if (version === 0) {
      //     const oldTransfers = persistedState as { completedTransfers: CompletedTransferV0[] }

      //     const migratedTransfers = oldTransfers.completedTransfers.map(transfer => ({
      //       id: transfer.id,
      //       result: transfer.result,
      //       sourceChain: transfer.sourceChain,
      //       destChain: transfer.destChain,
      //       sender: transfer.sender,
      //       recipient: transfer.recipient,
      //       date: transfer.date,
      //       fees: transfer.fees,
      //       bridgingFee: transfer.bridgingFee,
      //       minTokenRecieved: transfer.minTokenRecieved,
      //       minTokenRecievedValue: transfer.minTokenRecievedValue,
      //       explorerLink: transfer.explorerLink,
      //       errors: transfer.errors,

      //       // V0 Migrations
      //       sourceToken: transfer.token,
      //       sourceTokenUSDValue: transfer.tokenUSDValue,
      //       sourceAmount: transfer.amount,
      //     }))

      //     return { completedTransfers: migratedTransfers }
      //   }

      //   console.warn(`Unknown completed transfers version ${version}, resetting to initial state`)
      //   return { completedTransfers: [] }
      // },
    },
  ),
)
