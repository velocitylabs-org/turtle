import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { AmountInfo, CompletedTransfer } from '@/models/transfer'
import { migrateCompletedTransfers } from './migrations/completedTransfersMigration'
import { STORE_VERSIONS } from './migrations/constants'

interface CompletedTxState {
  completedTransfers: CompletedTransfer[]
  addCompletedTransfer: (completedTransfer: CompletedTransfer) => void
}

const serializeFeeAmount = (fees: AmountInfo): AmountInfo => ({
  ...fees,
  amount: fees.amount.toString(),
})

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
      version: STORE_VERSIONS.COMPLETED_TRANSFERS,
      migrate: migrateCompletedTransfers,
    },
  ),
)
