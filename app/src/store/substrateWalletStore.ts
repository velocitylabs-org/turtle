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
  modalOpen: boolean

  // Actions
  setAccount: (x: Account | null) => void
  setModalOpen: (isOpen: boolean) => void
}

// TODO: Add persistence of the account in local storage. It's easy with Zustand.
export const useSubstrateWalletStore = create<State>(set => ({
  // State
  account: null,
  modalOpen: false,

  // Actions
  setAccount: account => set({ account }),
  setModalOpen: isOpen => set({ modalOpen: isOpen }),
}))
