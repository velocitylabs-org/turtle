import type { InjectedAccount } from '@polkadot/extension-inject/types'
import { Signer } from '@polkadot/types/types'
import { create } from 'zustand'

export interface SubstrateAccount extends InjectedAccount {
  signer: Signer | undefined
}

interface State {
  // State
  account: SubstrateAccount | null
  evmAccount: SubstrateAccount | null
  modalOpen: boolean
  type: 'Substrate' | 'SubstrateEVM'

  // Actions
  setAccount: (x: SubstrateAccount | null) => void
  setEvmAccount: (x: SubstrateAccount | null) => void
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
