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

// Current version of the store schema
const currentVersion = 1

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
      version: currentVersion,
      migrate: (persistedState, version) => {
        // If the stored version is current, return the state as is
        if (version === currentVersion) return persistedState as any

        // Handle migrations for different versions
        // For example, if we're upgrading from version 0 to 1:
        if (version === 0) {
          // Transform the data structure as needed for version 1
          return {
            completedTransfers:
              (persistedState as any).completedTransfers?.map((transfer: CompletedTransfer) => ({
                ...transfer,
                // Add new fields or transform existing ones
              })) || [],
          }
        }

        // If we don't know how to migrate, return an empty state
        return { completedTransfers: [] }
      },
    },
  ),
)
