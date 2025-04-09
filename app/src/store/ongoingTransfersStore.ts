import { AmountInfo, StoredTransfer, StoredTransferV0 } from '@/models/transfer'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const currentStoreVersion = 1

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
      version: currentStoreVersion,
      migrate: (persistedState, version) => {
        if (version === currentStoreVersion) return persistedState

        if (version === 0) {
          const oldTransfers = persistedState as { transfers: StoredTransferV0[] }

          const migratedTransfers = oldTransfers.transfers.map(transfer => ({
            // Copy all fields from RawTransfer
            id: transfer.id,
            sourceChain: transfer.sourceChain,
            destChain: transfer.destChain,
            sender: transfer.sender,
            recipient: transfer.recipient,
            date: transfer.date,
            crossChainMessageHash: transfer.crossChainMessageHash,
            parachainMessageId: transfer.parachainMessageId,
            sourceChainExtrinsicIndex: transfer.sourceChainExtrinsicIndex,
            fees: transfer.fees,
            bridgingFee: transfer.bridgingFee,
            environment: transfer.environment,
            sendResult: transfer.sendResult,
            uniqueTrackingId: transfer.uniqueTrackingId,
            status: transfer.status,
            finalizedAt: transfer.finalizedAt,

            // V0 Migrations
            sourceToken: transfer.token,
            sourceAmount: transfer.amount,
            sourceTokenUSDValue: transfer.tokenUSDValue,
            swapInformation: undefined,
          }))

          return { transfers: migratedTransfers }
        }

        console.warn(`Unknown ongoing transfers version ${version}, resetting to initial state`)
        return { transfers: [] }
      },
    },
  ),
)
