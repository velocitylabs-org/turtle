import type { InjectedAccount, InjectedExtension } from '@polkadot/extension-inject/types'
import { captureException } from '@sentry/nextjs'
import { useEffect, useState } from 'react'
import { useSubstrateWalletStore } from '@/store/substrateWalletStore'

const useSubstrateWallet = () => {
  const substrateAccount = useSubstrateWalletStore(state => state.account)
  const setSubstrateAccount = useSubstrateWalletStore(state => state.setAccount)
  const evmAccount = useSubstrateWalletStore(state => state.evmAccount)
  const setEvmAccount = useSubstrateWalletStore(state => state.setEvmAccount)
  const isModalOpen = useSubstrateWalletStore(state => state.modalOpen)
  const setModalOpen = useSubstrateWalletStore(state => state.setModalOpen)
  const type = useSubstrateWalletStore(state => state.type)
  const setType = useSubstrateWalletStore(state => state.setType)

  /** The extensions that are available to connect to. Must be fetched manually. */
  const [extensions, setExtensions] = useState<InjectedExtension[]>([])
  /** The extension that is connected. */
  const [selectedExtension, setSelectedExtension] = useState<InjectedExtension | null>(null)
  /** The accounts that are available for the selected extension. */
  const [accounts, setAccounts] = useState<InjectedAccount[]>([])
  /** Loading state for fetching extensions or accounts. */
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
      if (selectedExtension) {
        try {
          setLoading(true)
          unsubscribe = selectedExtension.accounts.subscribe(injectedAccounts => {
            setAccounts(injectedAccounts)
            setLoading(false)
          })
        } catch (error) {
          console.error('Error fetching accounts:', error)
          captureException(error)
          setLoading(false)
        }
      }
    }

    subscribeAccounts()

    // Cleanup
    return () => unsubscribe()
  }, [selectedExtension])

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
    selectedExtension,
    setSelectedExtension,
    accounts,
    type,
    setType,
  }
}

export default useSubstrateWallet
