import useEvmWallet from '@/hooks/useEvmWallet'
import { AddressType } from '@/models/chain'
import useSubstrateWallet from './useSubstrateWallet'
import { Sender } from './useTransfer'

export interface WalletInfo {
  sender?: Sender
  disconnect: () => void
  isConnected: boolean
  openModal: () => void
  closeModal: () => void
}

const useWallet = (addressType?: AddressType): WalletInfo | undefined => {
  const {
    signer,
    disconnect: evmDisconnect,
    isConnected: evmIsConnected,
    openModal: openEvmModal,
    closeModal: closeEvmModal,
  } = useEvmWallet()
  const {
    substrateAccount,
    disconnect: substrateDisconnect,
    openModal: openSubstrateModal,
    closeModal: closeSubstrateModal,
  } = useSubstrateWallet()

  if (!addressType) return

  switch (addressType) {
    case 'evm':
      return {
        sender: signer,
        disconnect: evmDisconnect,
        isConnected: evmIsConnected,
        openModal: openEvmModal,
        closeModal: closeEvmModal,
      }
    case 'ss58':
      return {
        sender: substrateAccount ?? undefined,
        disconnect: substrateDisconnect,
        isConnected: !!substrateAccount,
        openModal: openSubstrateModal,
        closeModal: closeSubstrateModal,
      }
  }
}

export default useWallet
