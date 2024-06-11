import { create } from 'zustand'

export interface Account {
  address: string
  source: string
  name?: string
  wallet?: unknown
  signer?: unknown
}

interface State {
  // State
  account: Account | null

  // Actions
  setAccount: (x: Account | null) => void
}

export const useSubstrateWalletStore = create<State>(set => ({
  // State
  account: null,

  // Actions
  setAccount: x =>
    set(_ => ({
      account: x,
    })),
}))
