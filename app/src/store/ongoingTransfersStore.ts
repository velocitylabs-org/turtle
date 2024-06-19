import { Transfer } from '@/models/transfer'
import { create } from 'zustand'

interface State {
  // State
  transfers: Transfer[]

  // Actions
  addTransfer: (transfer: Transfer) => void
  removeTransfer: (id: string) => void
}

export const useOngoingTransfersStore = create<State>(set => ({
  // State
  transfers: [],

  // Actions
  addTransfer: transfer =>
    set(state => ({
      transfers: [...state.transfers, transfer],
    })),

  removeTransfer: id =>
    set(state => ({
      transfers: state.transfers.filter(n => n.id !== id),
    })),
}))
