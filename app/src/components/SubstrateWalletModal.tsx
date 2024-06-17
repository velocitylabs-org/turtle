'use client'
import useSubstrateWallet from '@/hooks/useSubstrateWallet'
import { Account } from '@/store/substrateWalletStore'
import { truncateAddress } from '@/utils/address'
import Identicon from '@polkadot/react-identicon'
import { WalletSelect } from '@talismn/connect-components'
import { FC } from 'react'

interface SubstrateWalletModalProps {
  /** Whether the modal is open. */
  open?: boolean
  /** Callback when the modal is closed. */
  onClose?: () => void
}

const SubstrateWalletModal: FC<SubstrateWalletModalProps> = ({ open, onClose = () => {} }) => {
  const { substrateAccount, setSubstrateAccount } = useSubstrateWallet()

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
      open={open}
      onWalletConnectClose={() => onClose()}
      onAccountSelected={account => setSubstrateAccount(account)}
      onUpdatedAccounts={handleUpdatedAccounts}
      onError={error => {
        if (error) console.error(error)
      }}
    />
  )
}

export default SubstrateWalletModal
