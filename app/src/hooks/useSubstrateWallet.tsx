import { useSubstrateWalletStore } from '@/store/substrateWalletStore'
import { useState } from 'react'

const useSubstrateWallet = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const substrateAccount = useSubstrateWalletStore(state => state.account)
  const setSubstrateAccount = useSubstrateWalletStore(state => state.setAccount)

  const openModal = () => setModalOpen(true)
  const closeModal = () => setModalOpen(false)
  const isConnected = !!substrateAccount

  // TODO: implement this. clear store.
  const disconnect = () => {
    console.log('disconnect')
  }

  return {
    substrateAccount,
    setSubstrateAccount,
    disconnect,
    isConnected,
    openModal,
    closeModal,
    modalOpen,
  }
}

export default useSubstrateWallet
