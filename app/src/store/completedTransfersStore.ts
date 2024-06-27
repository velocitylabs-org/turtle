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
        if (newCompletedTransfer === undefined || newCompletedTransfer === null) return
        return set(state => ({
          completedTransfers: [...state.completedTransfers, newCompletedTransfer],
        }))
      },
    }),
    {
      name: 'turtle-completed-transactions',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({ completedTransfers: state.completedTransfers }),
    },
  ),
)
