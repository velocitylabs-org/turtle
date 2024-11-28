import { useSubstrateWalletStore } from '@/store/substrateWalletStore'
import { captureException } from '@sentry/nextjs'
import { useEffect } from 'react'

const useSubstrateWallet = () => {
  const substrateAccount = useSubstrateWalletStore(state => state.account)
  const setSubstrateAccount = useSubstrateWalletStore(state => state.setAccount)
  const evmAccount = useSubstrateWalletStore(state => state.evmAccount)
  const setEvmAccount = useSubstrateWalletStore(state => state.setEvmAccount)
  const isModalOpen = useSubstrateWalletStore(state => state.modalOpen)
  const setModalOpen = useSubstrateWalletStore(state => state.setModalOpen)
  const type = useSubstrateWalletStore(state => state.type)
  const setType = useSubstrateWalletStore(state => state.setType)

  const openModal = () => setModalOpen(true)
  const closeModal = () => setModalOpen(false)
  const isSubstrateConnected = !!substrateAccount
  const disconnectSubstrate = () => setSubstrateAccount(null)
  const isEvmConnected = !!evmAccount
  const disconnectEvm = () => setEvmAccount(null)

  useEffect(() => {
    let unsubscribe = () => {}

    const initializeExtensionsAndSubscribe = async () => {
      try {
        const { web3Enable, web3AccountsSubscribe } = await import('@polkadot/extension-dapp')
        const enabledExtensions = await web3Enable('turtle')
        //setExtensions(enabledExtensions)
        if (enabledExtensions.length === 0) {
          console.warn('No extensions enabled or user rejected authorization.')
          return
        }

        unsubscribe = await web3AccountsSubscribe(injectedAccounts => {
          //setAccounts(injectedAccounts)
        })
      } catch (error) {
        console.error('Error initializing extensions and subscribing to accounts:', error)
        captureException(error)
      }
    }

    initializeExtensionsAndSubscribe()

    // Cleanup
    return () => {
      unsubscribe()
    }
  }, [])

  return {
    substrateAccount,
    setSubstrateAccount,
    evmAccount,
    setEvmAccount,
    disconnectSubstrate,
    isSubstrateConnected,
    disconnectEvm,
    isEvmConnected,
    openModal,
    closeModal,
    isModalOpen,

    type,
    setType,
  }
}

export default useSubstrateWallet
