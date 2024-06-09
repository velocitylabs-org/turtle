'use client'
import useSubstrateWallet from '@/hooks/useSubstrateWallet'
import { truncateAddress } from '@/utils/address'
import Identicon from '@polkadot/react-identicon'
import { WalletSelect } from '@talismn/connect-components'
import { FC } from 'react'

interface WalletAccount {
  address: string
  source: string
  name?: string
  wallet?: unknown
  signer?: unknown
}

interface SubstrateWalletButtonProps {
  /** Text shown inside the button. */
  label?: string
}

const SubstrateWalletButton: FC<SubstrateWalletButtonProps> = ({ label = 'Connect Wallet' }) => {
  const { substrateAccount, setSubstrateAccount } = useSubstrateWallet()

  // removes the active account if it is disconnected from the app
  const handleUpdatedAccounts = (accounts?: WalletAccount[]) => {
    if (!accounts || !substrateAccount) return
    if (accounts.some(x => x.address === substrateAccount.address)) return

    setSubstrateAccount(null)
  }

  // Prevents click event propagation
  const handleIdenticonClick = (event: React.MouseEvent) => {
    event.stopPropagation()
  }

  const buttonContent = substrateAccount?.address ? (
    <div className="flex items-center gap-2">
      <div onClick={handleIdenticonClick}>
        <Identicon value={substrateAccount.address} size={20} theme="polkadot" />
      </div>
      <p>{truncateAddress(substrateAccount.address)}</p>
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
        setSubstrateAccount(account)
      }}
      onUpdatedAccounts={handleUpdatedAccounts}
      onError={error => {
        if (error) console.error(error)
      }}
    />
  )
}

export default SubstrateWalletButton
