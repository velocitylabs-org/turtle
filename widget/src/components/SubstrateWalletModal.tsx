import useSubstrateWallet from '@/hooks/useSubstrateWallet'
import { truncateAddress } from '@/utils/address'
import { getWalletLogo, getWalletName } from '@/utils/wallet'
import type { InjectedAccount, InjectedExtension } from '@polkadot/extension-inject/types'
import { motion } from 'framer-motion'
import { FC, useEffect, useState } from 'react'
import { colors } from '../../tailwind.config'
import { Button, LoadingIcon } from '@velocitylabs-org/turtle-ui'
import { Icon } from './Icon'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'

const SubstrateWalletModal: FC = () => {
  const [currentView, setCurrentView] = useState<'extensions' | 'accounts'>('extensions')
  const {
    isModalOpen,
    closeModal,
    openModal,
    extensions,
    type,
    setSubstrateAccount,
    setEvmAccount,
    fetchExtensions,
    selectedExtension,
    setSelectedExtension,
    accounts,
    loading,
  } = useSubstrateWallet()

  const handleExtensionSelect = async (extension: InjectedExtension) => {
    setSelectedExtension(extension)
    setCurrentView('accounts')
  }

  const handleAccountSelect = async (account: InjectedAccount) => {
    if (type === 'Substrate')
      setSubstrateAccount({ ...account, pjsSigner: selectedExtension?.signer })
    else if (type === 'SubstrateEVM')
      setEvmAccount({ ...account, pjsSigner: selectedExtension?.signer })
    closeModal()
  }

  useEffect(() => {
    const fetch = async () => {
      try {
        if (isModalOpen) {
          setCurrentView('extensions')
          setSelectedExtension(null)
          await fetchExtensions()
        }
      } catch (error) {
        console.error('Error fetching extensions:', error)
      }
    }

    fetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen])

  const filteredAccounts = accounts.filter(account =>
    type === 'SubstrateEVM' ? account.type === 'ethereum' : account.type === 'sr25519',
  )

  return (
    <Dialog open={isModalOpen} onOpenChange={open => (open ? openModal() : closeModal())}>
      <DialogContent
        className="m-auto max-h-[85vh] max-w-[90vw] rounded-4xl border border-black pb-4 focus:outline-none min-[460px]:max-w-[25rem]"
        hideCloseButton={true}
      >
        {/* Header */}
        <DialogHeader className="flex items-center justify-center rounded-t-4xl p-4">
          {currentView === 'accounts' && (
            <div className="absolute left-0">
              <Button variant="ghost" size="md" onClick={() => setCurrentView('extensions')}>
                ←
              </Button>
            </div>
          )}
          <DialogTitle className="mt-1 text-base font-bold">
            {currentView === 'extensions' ? 'Connect Wallet' : 'Connect Account'}
          </DialogTitle>
        </DialogHeader>

        {/* Animate Height Transition */}
        <motion.div
          className="flex max-h-[15rem] min-h-[130px] flex-col items-center justify-start space-y-2 overflow-y-auto p-6 pt-3 text-base"
          layout
          initial={{ height: currentView === 'extensions' ? '10rem' : '11.8rem' }}
          animate={{ height: currentView === 'extensions' ? '10rem' : '11.8rem' }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          {/* Loading */}
          {loading && (
            <div className="flex h-full w-full items-center justify-center">
              <LoadingIcon className="animate-spin" size="lg" color={colors['turtle-secondary']} />
            </div>
          )}

          {/* Show extensions */}
          {currentView === 'extensions' &&
            !loading &&
            (extensions.length > 0 ? (
              extensions.map(extension => (
                <Button
                  key={extension.name}
                  className="flex min-h-12 w-full items-center justify-between rounded-[12px] border-0 bg-turtle-level1 p-4 hover:bg-opacity-95"
                  variant="outline"
                  onClick={() => handleExtensionSelect(extension)}
                >
                  <div className="flex items-center space-x-2 text-sm">
                    <Icon src={getWalletLogo(extension.name, window)} width={40} height={40} />
                    <span>{getWalletName(extension.name, window)}</span>
                  </div>
                  <span className="rounded-[5px] bg-turtle-primary-light px-[5px] py-[3px] text-[9px] text-xs font-bold text-turtle-primary-dark text-opacity-80">
                    INSTALLED
                  </span>
                </Button>
              ))
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <p className="text-center text-sm text-turtle-level6">
                  <span className="font-bold">Oops! </span>No extensions detected. Please install a
                  compatible wallet extension, such as Talisman, Subwallet, or Polkadot.js.
                </p>
              </div>
            ))}

          {/* Show accounts */}
          {currentView === 'accounts' &&
            !loading &&
            (filteredAccounts.length > 0 ? (
              filteredAccounts.map(account => (
                <Button
                  key={account.address}
                  className="flex min-h-12 w-full items-center justify-between rounded-[12px] border-0 bg-turtle-level1 p-4 hover:bg-opacity-95"
                  variant="outline"
                  onClick={() => handleAccountSelect(account)}
                >
                  <div className="flex flex-col items-start space-y-1 text-sm">
                    <span className="font-medium">{account.name || 'Unnamed Account'}</span>
                    <span className="text-xs text-turtle-level6">
                      {truncateAddress(account.address)}
                    </span>
                  </div>
                  <span className="rounded-[5px] bg-turtle-primary-light px-[5px] py-[3px] text-[9px] text-xs font-bold text-turtle-primary-dark text-opacity-80">
                    CONNECT
                  </span>
                </Button>
              ))
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <p className="text-center text-sm text-turtle-level6">
                  <span className="font-bold">Oops! </span>No accounts available. Please connect an
                  account to Turtle inside your wallet extension.
                </p>
              </div>
            ))}
        </motion.div>

        {/* Footer */}
        <motion.div
          layout
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          {currentView === 'extensions' && <Footer />}
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
const Footer: FC = () => {
  return (
    <div className="mb-1 mt-4 text-center text-xs text-gray-500">
      Haven&apos;t got a wallet?{' '}
      <a
        href="https://support.polkadot.network/support/solutions/articles/65000098878-how-to-create-a-polkadot-account"
        className="text-blue-500"
      >
        Get started
      </a>
    </div>
  )
}

export default SubstrateWalletModal
