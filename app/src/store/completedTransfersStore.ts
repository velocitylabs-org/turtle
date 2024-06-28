import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { CompletedTransfer } from '@/models/transfer'

interface CompletedTxState {
  completedTransfers: CompletedTransfer[]
  addCompletedTransfer: (completedTransfer: CompletedTransfer) => void
}

export const useCompletedTransfersStore = create<CompletedTxState>()(
  persist(
    set => ({
      completedTransfers: [],

      addCompletedTransfer: newCompletedTransfer => {
        if (!newCompletedTransfer) return
        set(state => {
          // Check if the newCompletedTransfer already exists in the local store
          const transferExists = state.completedTransfers.some(
            transfer => transfer.id === newCompletedTransfer.id,
          )

          if (transferExists) return { completedTransfers: state.completedTransfers }

          return {
            completedTransfers: [...state.completedTransfers, newCompletedTransfer],
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
