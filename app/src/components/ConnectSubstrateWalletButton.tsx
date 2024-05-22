'use client'
import { truncateAddress } from '@/utils/address'
import Identicon from '@polkadot/react-identicon'
import { WalletSelect } from '@talismn/connect-components'
import { FC, useState } from 'react'

interface WalletAccount {
  address: string
  source: string
  name?: string
  wallet?: unknown
  signer?: unknown
}

interface ConnectSubstrateWalletButtonProps {
  /** Text shown inside the button. */
  label?: string
}

const ConnectSubstrateWalletButton: FC<ConnectSubstrateWalletButtonProps> = ({
  label = 'Connect Wallet',
}) => {
  const [activeAccount, setActiveAccount] = useState<WalletAccount | null>(null)

  // removes the active account if it is disconnected from the app
  const handleUpdatedAccounts = (accounts?: WalletAccount[]) => {
    if (!accounts || !activeAccount) return
    if (accounts.some(x => x.address === activeAccount.address)) return

    setActiveAccount(null)
  }

  // Prevents click event propagation
  const handleIdenticonClick = (event: React.MouseEvent) => {
    event.stopPropagation()
  }

  const buttonContent = activeAccount?.address ? (
    <div className="flex items-center gap-2">
      <div onClick={handleIdenticonClick}>
        <Identicon value={activeAccount.address} size={20} theme="polkadot" />
      </div>
      <p>{truncateAddress(activeAccount.address)}</p>
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
        <button className="btn btn-sm max-w-40 rounded-2xl ">{buttonContent}</button>
      }
      onAccountSelected={account => {
        setActiveAccount(account)
      }}
      onUpdatedAccounts={handleUpdatedAccounts}
      onError={error => {
        if (error) console.error(error)
      }}
    />
  )
}

export default ConnectSubstrateWalletButton
