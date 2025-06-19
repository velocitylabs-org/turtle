import { Chain, ManualRecipient, Token, TokenAmount } from '@velocitylabs-org/turtle-registry'
import { create } from 'zustand'
import { WalletInfo } from '@/hooks/useWallet'

interface FormStore {
  sourceChain: Chain | null
  destinationChain: Chain | null
  sourceToken: TokenAmount | null
  destinationToken: Token | null
  manualRecipient: ManualRecipient
  destinationWallet: WalletInfo | undefined
  sourceWallet: WalletInfo | undefined
  setSourceChain: (sourceChain: Chain) => void
  setDestinationChain: (destinationChain: Chain) => void
  setSourceToken: (sourceToken: TokenAmount) => void
  setDestinationToken: (destinationToken: Token) => void
  setManualRecipient: (manualRecipient: ManualRecipient) => void
  setDestinationWallet: (destinationWallet: WalletInfo) => void
  setSourceWallet: (sourceWallet: WalletInfo) => void
}

export const useFormStore = create<
  FormStore & {
    setStoreValues: (values: Partial<FormStore>) => void
  }
>(set => ({
  sourceChain: null,
  destinationChain: null,
  sourceToken: null,
  destinationToken: null,
  manualRecipient: { enabled: false, address: '' },
  destinationWallet: undefined,
  sourceWallet: undefined,
  setSourceChain: (sourceChain: Chain) => set({ sourceChain }),
  setDestinationChain: (destinationChain: Chain) => set({ destinationChain }),
  setSourceToken: (sourceToken: TokenAmount) => set({ sourceToken }),
  setDestinationToken: (destinationToken: Token) => set({ destinationToken }),
  setManualRecipient: (manualRecipient: ManualRecipient) => set({ manualRecipient }),
  setDestinationWallet: (destinationWallet: WalletInfo) => set({ destinationWallet }),
  setSourceWallet: (sourceWallet: WalletInfo) => set({ sourceWallet }),
  setStoreValues: (values: Partial<FormStore>) => set(values),
}))
