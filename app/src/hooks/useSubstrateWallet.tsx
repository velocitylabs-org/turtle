import { useSubstrateWalletStore } from '@/store/substrateWalletStore'
import type { InjectedAccountWithMeta, InjectedExtension } from '@polkadot/extension-inject/types'
import { captureException } from '@sentry/nextjs'
import { useEffect, useState } from 'react'

const useSubstrateWallet = () => {
  const substrateAccount = useSubstrateWalletStore(state => state.account)
  const setSubstrateAccount = useSubstrateWalletStore(state => state.setAccount)
  const evmAccount = useSubstrateWalletStore(state => state.evmAccount)
  const setEvmAccount = useSubstrateWalletStore(state => state.setEvmAccount)
  const isModalOpen = useSubstrateWalletStore(state => state.modalOpen)
  const setModalOpen = useSubstrateWalletStore(state => state.setModalOpen)
  const type = useSubstrateWalletStore(state => state.type)
  const setType = useSubstrateWalletStore(state => state.setType)

  const [extensions, setExtensions] = useState<InjectedExtension[]>([])
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([])
  const [loading, setLoading] = useState(false)

  const openModal = () => setModalOpen(true)
  const closeModal = () => setModalOpen(false)
  const isSubstrateConnected = !!substrateAccount
  const disconnectSubstrate = () => setSubstrateAccount(null)
  const isEvmConnected = !!evmAccount
  const disconnectEvm = () => setEvmAccount(null)

  const fetchExtensions = async () => {
    try {
      setLoading(true)
      const { web3Enable } = await import('@polkadot/extension-dapp')
      const enabledExtensions = await web3Enable('turtle')
      setExtensions(enabledExtensions)
    } catch (error) {
      console.error('Error fetching extensions:', error)
      captureException(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let unsubscribe = () => {}

    const subscribeAccounts = async () => {
      if (!extensions.length) return

      try {
        setLoading(true)
        const { web3AccountsSubscribe } = await import('@polkadot/extension-dapp')
        unsubscribe = await web3AccountsSubscribe(injectedAccounts => {
          setAccounts(injectedAccounts)
        })
      } catch (error) {
        console.error('Error initializing extensions and subscribing to accounts:', error)
        captureException(error)
      } finally {
        setLoading(false)
      }
    }

    subscribeAccounts()

    // Cleanup
    return () => {
      unsubscribe()
    }
  }, [extensions])

  return {
    substrateAccount,
    setSubstrateAccount,
    fetchExtensions,
    evmAccount,
    setEvmAccount,
    disconnectSubstrate,
    isSubstrateConnected,
    disconnectEvm,
    isEvmConnected,
    openModal,
    closeModal,
    loading,
    isModalOpen,
    extensions,
    accounts,
    type,
    setType,
  }
}

export default useSubstrateWallet
