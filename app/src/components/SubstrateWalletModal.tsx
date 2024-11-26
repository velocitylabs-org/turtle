'use client'
import useSubstrateWallet from '@/hooks/useSubstrateWallet'
import { Account } from '@/store/substrateWalletStore'
import { isMobileDevice } from '@/utils/env'
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp'
import { WalletSelect } from '@talismn/connect-components'
import { FC, useEffect, useState } from 'react'
import { WalletNotAccessible } from './WalletNotAccessible'

const SubstrateWalletModal: FC = () => {
  const [isMobile, setIsMobile] = useState(false)
  const {
    substrateAccount,
    setSubstrateAccount,
    evmAccount,
    setEvmAccount,
    isModalOpen,
    closeModal,
  } = useSubstrateWallet()

  const allInjected = await web3Enable('my cool dapp')

  useEffect(() => {
    const userAgent = typeof window !== 'undefined' && navigator.userAgent
    if (userAgent) {
      setIsMobile(isMobileDevice(userAgent))
    }
  }, [])

  useEffect(() => {
    const fetchAccounts = async () => {
      const extensions = await web3Enable('turtle')
      if (extensions.length > 0) {
        const accounts = await web3Accounts()
      }
    }

    fetchAccounts()
  }, [])

  // removes the active account if it is disconnected from the app
  const handleUpdatedAccounts = (accounts?: Account[]) => {
    if (!accounts || (!substrateAccount && !evmAccount)) return
    if (
      accounts.some(
        x => x.address === substrateAccount?.address || x.address === evmAccount?.address,
      )
    )
      return

    setSubstrateAccount(null)
  }

  return (
    <WalletSelect
      onlyShowInstalled
      dappName="turtle"
      showAccountsList={true}
      open={isModalOpen}
      footer={isMobile && <WalletNotAccessible />}
      onWalletConnectClose={() => closeModal()}
      onAccountSelected={account =>
        account.address.startsWith('0x')
          ? setEvmAccount(account as Account)
          : setSubstrateAccount(account as Account)
      }
      onUpdatedAccounts={accounts => handleUpdatedAccounts(accounts as Account[])}
      onError={error => {
        if (error) console.error(error)
      }}
    />
  )
}

export default SubstrateWalletModal
