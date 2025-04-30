import { AmountInfo, StoredTransfer } from '@/models/transfer'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { STORE_VERSIONS } from './migrations/constants'
import { migrateOngoingTransfers } from './migrations/ongoingTransfersMigration'

interface State {
  // State
  transfers: StoredTransfer[]

  // Actions
  addOrUpdate: (transfer: StoredTransfer) => void
  updateUniqueId: (id: string, uniqueTrackingId: string) => void
  updateStatus: (id: string) => void
  remove: (id: string) => void
}

const serializeFeeAmount = (fees: AmountInfo): AmountInfo => ({
  ...fees,
  amount: fees.amount.toString(),
})

export const useOngoingTransfersStore = create<State>()(
  persist(
    set => ({
      // State
      transfers: [],

      // Actions
      addOrUpdate: newOngoingTransfer => {
        if (!newOngoingTransfer) return

        const persistableTransfer = {
          ...newOngoingTransfer,
          fees: serializeFeeAmount(newOngoingTransfer.fees),
          ...(newOngoingTransfer.bridgingFee && {
            bridgingFee: serializeFeeAmount(newOngoingTransfer.bridgingFee),
          }),
          swapInformation: undefined, // set to undefined for now to avoid circular references. It's not used at the moment for 1 click swaps.
        }

        console.log('Adding or updating transfer', persistableTransfer)
        set(state => {
          const transferExists = state.transfers.some(
            transfer => transfer.id === persistableTransfer.id,
          )

          if (transferExists) {
            return {
              transfers: state.transfers.map(transfer =>
                transfer.id === persistableTransfer.id ? persistableTransfer : transfer,
              ),
            }
          }

          return {
            transfers: [...state.transfers, persistableTransfer],
          }
        })
      },

      updateUniqueId: (id: string, uniqueTrackingId: string) => {
        if (!id || !uniqueTrackingId) return
        set(state => ({
          transfers: state.transfers.map(transfer =>
            transfer.id === id ? { ...transfer, uniqueTrackingId } : transfer,
          ),
        }))
      },

      updateStatus: (id: string) => {
        if (!id) return
        set(state => ({
          transfers: state.transfers.map(transfer =>
            transfer.id === id
              ? {
                  ...transfer,
                  status: `Arriving at ${transfer.destChain.name}`,
                  finalizedAt: new Date(),
                }
              : transfer,
          ),
        }))
      },

      remove: id => {
        if (!id) return
        set(state => ({
          transfers: state.transfers.filter(transfer => transfer.id !== id),
        }))
      },
    }),
    {
      name: 'turtle-ongoing-transactions',
      storage: createJSONStorage(() => localStorage),
      version: STORE_VERSIONS.ONGOING_TRANSFERS,
      migrate: migrateOngoingTransfers,
    },
  ),
)
