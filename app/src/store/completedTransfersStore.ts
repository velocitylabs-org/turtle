import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { AmountInfo, CompletedTransfer } from '@/models/transfer'

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
    },
  ),
)
