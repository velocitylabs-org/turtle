import useEvmWallet from '@/hooks/useEvmWallet'
import { WalletType } from '@/models/chain'
import useSubstrateWallet from '@/hooks/useSubstrateWallet'
import { Sender } from '@/hooks/useTransfer'

export interface WalletInfo {
  sender?: Sender
  disconnect: () => void
  isConnected: boolean
  openModal: () => void
  closeModal: () => void
}

const useWallet = (walletType?: WalletType): WalletInfo | undefined => {
  const {
    signer,
    disconnect: evmDisconnect,
    isConnected: evmIsConnected,
    openModal: openEvmModal,
    closeModal: closeEvmModal,
  } = useEvmWallet()

  const {
    substrateAccount,
    evmAccount,
    isSubstrateConnected,
    isEvmConnected: isSubstrateEvmConnected,
    disconnectSubstrate,
    disconnectEvm: DisconnectSubstrateEvm,
    openModal: openSubstrateModal,
    closeModal: closeSubstrateModal,
  } = useSubstrateWallet()

  if (!walletType) return

  switch (walletType) {
    case 'EVM':
      return {
        sender: signer,
        disconnect: evmDisconnect,
        isConnected: evmIsConnected,
        openModal: openEvmModal,
        closeModal: closeEvmModal,
      }

    case 'Substrate':
      return {
        sender: substrateAccount ?? undefined,
        disconnect: disconnectSubstrate,
        isConnected: isSubstrateConnected,
        openModal: openSubstrateModal,
        closeModal: closeSubstrateModal,
      }

    case 'SubstrateEVM':
      return {
        sender: evmAccount ?? undefined,
        disconnect: DisconnectSubstrateEvm,
        isConnected: isSubstrateEvmConnected,
        openModal: openSubstrateModal,
        closeModal: closeSubstrateModal,
      }
  }
}

export default useWallet
