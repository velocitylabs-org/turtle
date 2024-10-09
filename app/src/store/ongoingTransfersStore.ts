import { StoredTransfer } from '@/models/transfer'
import { parse, stringify } from 'flatted'
import { create } from 'zustand'
import { persist, PersistStorage, StorageValue } from 'zustand/middleware'

interface State {
  // State
  transfers: StoredTransfer[]
  // Actions
  addTransfer: (transfer: StoredTransfer) => void
  removeTransfer: (id: string) => void
}

// Serialization - Stringify function for BigInt
function stringifyWithBigInt(value: StorageValue<StoredTransfer[]>) {
  return stringify(value, (_key, val) => (typeof val === 'bigint' ? `${val}n` : val))
}

// Serialization - Parse function for BigInt
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseWithBigInt(value: any) {
  return parse(value, (_key, val) => {
    if (typeof val === 'string' && /^\d+n$/.test(val)) {
      return BigInt(val.slice(0, -1))
    }
    return val
  })
}

const storage: PersistStorage<StoredTransfer[]> = {
  getItem: name => {
    const storedValue = localStorage.getItem(name)
    return storedValue ? parseWithBigInt(storedValue) : null
  },
  setItem: (name, value) => {
    localStorage.setItem(name, stringifyWithBigInt(value))
  },
  removeItem: name => {
    localStorage.removeItem(name)
  },
}

export const useOngoingTransfersStore = create<State>()(
  persist(
    set => ({
      // State
      transfers: [],

      // Actions
      addTransfer: newOngoingTransfer => {
        if (!newOngoingTransfer) return
        set(state => {
          // Check if the newOngoingTransfer already exists in the local storage
          if (state.transfers.some(transfer => transfer.id === newOngoingTransfer.id)) return state

          return {
            transfers: [...state.transfers, newOngoingTransfer],
          }
        })
      },

      removeTransfer: id => {
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
