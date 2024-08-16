'use client'
import useSubstrateWallet from '@/hooks/useSubstrateWallet'
import { Account } from '@/store/substrateWalletStore'
import { WalletSelect } from '@talismn/connect-components'
import { FC, useEffect, useState } from 'react'
import { WalletNotAccessible } from './WalletNotAccessible'
import { isMobileDevice } from '@/utils/env'

const SubstrateWalletModal: FC = () => {
  const [isMobile, setIsMobile] = useState(false)
  const { substrateAccount, setSubstrateAccount, isModalOpen, closeModal } = useSubstrateWallet()

  useEffect(() => {
    const userAgent = typeof window !== 'undefined' && navigator.userAgent
    if (userAgent) {
      setIsMobile(isMobileDevice(userAgent))
    }
  }, [])

  // removes the active account if it is disconnected from the app
  const handleUpdatedAccounts = (accounts?: Account[]) => {
    if (!accounts || !substrateAccount) return
    if (accounts.some(x => x.address === substrateAccount.address)) return

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
      onAccountSelected={account => setSubstrateAccount(account)}
      onUpdatedAccounts={handleUpdatedAccounts}
      onError={error => {
        if (error) console.error(error)
      }}
    />
  )
}

export default SubstrateWalletModal
