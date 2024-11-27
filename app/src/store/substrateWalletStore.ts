import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types'
import { create } from 'zustand'

interface State {
  // State
  account: InjectedAccountWithMeta | null
  evmAccount: InjectedAccountWithMeta | null
  modalOpen: boolean
  type: 'Substrate' | 'SubstrateEVM'

  // Actions
  setAccount: (x: InjectedAccountWithMeta | null) => void
  setEvmAccount: (x: InjectedAccountWithMeta | null) => void
  setModalOpen: (isOpen: boolean) => void
  setType: (type: 'Substrate' | 'SubstrateEVM') => void
}

// TODO: Add persistence of the account in local storage. It's easy with Zustand.
export const useSubstrateWalletStore = create<State>(set => ({
  // State
  account: null,
  evmAccount: null,
  modalOpen: false,
  type: 'Substrate',

  // Actions
  setAccount: account => set({ account }),
  setEvmAccount: account => set({ evmAccount: account }),
  setModalOpen: isOpen => set({ modalOpen: isOpen }),
  setType: type => set({ type }),
}))
