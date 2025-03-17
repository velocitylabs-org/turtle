import { AmountInfo, StoredTransfer } from '@/models/transfer'
import { create } from 'zustand'
import { persist, PersistStorage } from 'zustand/middleware'

interface State {
  // State
  transfers: StoredTransfer[]

  // Actions
  addOrUpdate: (transfer: StoredTransfer) => void
  updateUniqueId: (id: string, uniqueTrackingId: string) => void
  updateStatus: (id: string) => void
  updateProgress: (id: string) => void
  remove: (id: string) => void
}

const storage: PersistStorage<StoredTransfer[]> = {
  getItem: name => {
    const storedValue = localStorage.getItem(name)
    return storedValue ? JSON.parse(storedValue) : null
  },
  setItem: (name, value) => {
    localStorage.setItem(name, JSON.stringify(value))
  },
  removeItem: name => {
    localStorage.removeItem(name)
  },
}

const serializeFeeAmount = (fees: AmountInfo): AmountInfo => {
  return {
    ...fees,
    amount: fees.amount.toString(),
  }
}

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
        }

        set(state => {
          // Update it if it's already present
          if (state.transfers.some(transfer => transfer.id === persistableTransfer.id)) {
            return {
              transfers: state.transfers.map(tx =>
                tx.id === persistableTransfer.id ? persistableTransfer : tx,
              ),
            }
          }

          // Add it
          return {
            transfers: [...state.transfers, persistableTransfer],
          }
        })
      },

      updateUniqueId: (id: string, uniqueTrackingId: string) => {
        if (!id || !uniqueTrackingId) return
        set(state => {
          return {
            transfers: state.transfers.map(transfer => {
              if (transfer.id == id) {
                transfer.uniqueTrackingId = uniqueTrackingId
              }
              return transfer
            }),
          }
        })
      },

      updateStatus: (id: string) => {
        if (!id) return
        set(state => {
          return {
            transfers: state.transfers.map(transfer => {
              if (transfer.id == id) {
                transfer.status = `Arriving at ${transfer.destChain.name}`
                transfer.finalizedAt = new Date()
              }
              return transfer
            }),
          }
        })
      },

      updateProgress: (id: string) => {
        if (!id) return
        set(state => {
          return {
            transfers: state.transfers.map(transfer => {
              if (transfer.id == id) {
                transfer.progress = 100
              }
              return transfer
            }),
          }
        })
      },

      remove: id => {
        if (!id) return
        return set(state => ({
          transfers: state.transfers.filter(transfer => transfer.id !== id),
        }))
      },
    }),
    {
      name: 'turtle-ongoing-transactions',
      storage,
    },
  ),
)
