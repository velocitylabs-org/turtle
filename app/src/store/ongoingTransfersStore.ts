import { AmountInfo, StoredTransfer } from '@/models/transfer'
import { create } from 'zustand'
import { persist, PersistStorage } from 'zustand/middleware'

// Current version of the store schema
const currentVersion = 1
interface State {
  // State
  transfers: StoredTransfer[]

  // Actions
  addOrUpdate: (transfer: StoredTransfer) => void
  updateUniqueId: (id: string, uniqueTrackingId: string) => void
  updateStatus: (id: string) => void
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
          ...(newOngoingTransfer.bridgingFee && {
            bridgingFee: serializeFeeAmount(newOngoingTransfer.bridgingFee),
          }),
          swapInformation: undefined, // set to undefined for now to avoid circular references. It's not used at the moment for 1 click swaps.
        }

        console.log('Adding or updating transfer', persistableTransfer)
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
      version: currentVersion,
      /* migrate: (persistedState, version) => {
        // If the stored version is current, return the state as is
        if (version === currentVersion) return persistedState

        // Handle migrations for different versions
        if (version === 0) {
          const oldTransfers = persistedState as StoredTransferV0[]
          // Transform StoredTransferV0 to StoredTransfer
          const migratedTransfers = oldTransfers.map(oldTransfer => ({
            id: oldTransfer.id,
            sourceChain: oldTransfer.sourceChain,
            destChain: oldTransfer.destChain,
            sender: oldTransfer.sender,
            recipient: oldTransfer.recipient,
            sourceToken: oldTransfer.token,
            date: oldTransfer.date,
            crossChainMessageHash: oldTransfer.crossChainMessageHash,
            parachainMessageId: oldTransfer.parachainMessageId,
            sourceChainExtrinsicIndex: oldTransfer.sourceChainExtrinsicIndex,
            sourceTokenUSDValue: oldTransfer.tokenUSDValue,
            sourceAmount: oldTransfer.amount,
            destinationAmount: undefined,
            fees: oldTransfer.fees,
            bridgingFee: oldTransfer.bridgingFee,
            environment: oldTransfer.environment,
            sendResult: oldTransfer.sendResult,
            uniqueTrackingId: oldTransfer.uniqueTrackingId,
            status: oldTransfer.status,
            finalizedAt: oldTransfer.finalizedAt,
          })) as StoredTransfer[]

          return { transfers: migratedTransfers }
        }

        // If we don't know how to migrate, return an empty array
        return { transfers: [] }
      }, */
    },
  ),
)
