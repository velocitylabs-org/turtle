'use client'
import useSubstrateWallet from '@/hooks/useSubstrateWallet'
import { Account } from '@/store/substrateWalletStore'
import { truncateAddress } from '@/utils/address'
import Identicon from '@polkadot/react-identicon'
import { WalletSelect } from '@talismn/connect-components'
import { FC, useState } from 'react'

interface ConnectSubstrateWalletButtonProps {
  /** Text shown inside the button. */
  label?: string
}

const ConnectSubstrateWalletButton: FC<ConnectSubstrateWalletButtonProps> = ({
  label = 'Connect Wallet',
}) => {
  const { account, setAccount } = useSubstrateWallet()

  // removes the active account if it is disconnected from the app
  const handleUpdatedAccounts = (accounts?: Account[]) => {
    if (!accounts || !account) return
    if (accounts.some(x => x.address === account.address)) return

    setAccount(null)
  }

  // Prevents click event propagation
  const handleIdenticonClick = (event: React.MouseEvent) => {
    event.stopPropagation()
  }

  const buttonContent = account?.address ? (
    <div className="flex items-center gap-2">
      <div onClick={handleIdenticonClick}>
        <Identicon value={account.address} size={20} theme="polkadot" />
      </div>
      <p>{truncateAddress(account.address)}</p>
    </div>
  ) : (
    label
  )

  return (
    <WalletSelect
      onlyShowInstalled
      dappName="turtle"
      showAccountsList={true}
      triggerComponent={
        <button className="btn btn-sm max-w-40 rounded-2xl">{buttonContent}</button>
      }
      onAccountSelected={account => {
        console.log('Will set account to: ', account.address)
        setAccount(account)
      }}
      onUpdatedAccounts={handleUpdatedAccounts}
      onError={error => {
        if (error) console.error(error)
      }}
    />
  )
}

export default ConnectSubstrateWalletButton
