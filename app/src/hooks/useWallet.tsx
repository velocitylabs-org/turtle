import useEvmWallet from '@/hooks/useEvmWallet'
import { Network } from '@/models/chain'
import useSubstrateWallet from './useSubstrateWallet'
import { Sender } from './useTransfer'

export interface WalletInfo {
  sender?: Sender
  disconnect: () => void
  isConnected: boolean
  openModal: () => void
  closeModal: () => void
}

const useWallet = (network?: Network): WalletInfo | undefined => {
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

  if (!network) return

  switch (network) {
    case Network.Ethereum:
      return {
        sender: signer,
        disconnect: evmDisconnect,
        isConnected: evmIsConnected,
        openModal: openEvmModal,
        closeModal: closeEvmModal,
      }
    case Network.Polkadot:
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
