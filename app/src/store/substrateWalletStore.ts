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

// TODO: Add persistence of the account in local storage. It's easy with Zustand.
export const useSubstrateWalletStore = create<State>(set => ({
  // State
  account: null,

  // Actions
  setAccount: x =>
    set(_ => ({
      account: x,
    })),
}))
