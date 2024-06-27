import { StoredTransfer } from '@/models/transfer'
import { create } from 'zustand'
import { persist, PersistStorage, StorageValue } from 'zustand/middleware'
import { stringify, parse } from 'flatted'

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
      addTransfer: transfer => {
        if (transfer === undefined || transfer === null) return
        return set(state => ({
          transfers: [...state.transfers, transfer],
        }))
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
