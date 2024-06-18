'use client'
import useSubstrateWallet from '@/hooks/useSubstrateWallet'
import { Account } from '@/store/substrateWalletStore'
import { WalletSelect } from '@talismn/connect-components'
import { FC } from 'react'

const SubstrateWalletModal: FC = () => {
  const { substrateAccount, setSubstrateAccount, isModalOpen, closeModal } = useSubstrateWallet()

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
