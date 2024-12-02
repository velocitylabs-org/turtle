'use client'
import useSubstrateWallet from '@/hooks/useSubstrateWallet'
import { truncateAddress } from '@/utils/address'
import { isMobileDevice } from '@/utils/env'
import { getWalletLogo, getWalletName } from '@/utils/wallet'
import type { InjectedAccount, InjectedExtension } from '@polkadot/extension-inject/types'
import Image from 'next/image'
import { FC, useEffect, useState } from 'react'
import Button from './Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { WalletNotAccessible } from './WalletNotAccessible'
import { Icon } from './Icon'

const SubstrateWalletModal: FC = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [selectedExtension, setSelectedExtension] = useState<InjectedExtension | null>(null)
  const [extensionAccounts, setExtensionAccounts] = useState<InjectedAccount[]>([])
  const [currentView, setCurrentView] = useState<'extensions' | 'accounts'>('extensions')
  const {
    isModalOpen,
    closeModal,
    openModal,
    extensions,
    type,
    setSubstrateAccount,
    setEvmAccount,
  } = useSubstrateWallet()

  const handleExtensionSelect = async (extension: InjectedExtension) => {
    setSelectedExtension(extension)
    setCurrentView('accounts')
    setExtensionAccounts(await extension.accounts.get())
  }

  const handleAccountSelect = async (account: InjectedAccount) => {
    if (type === 'Substrate') setSubstrateAccount({ ...account, signer: selectedExtension?.signer })
    else if (type === 'SubstrateEVM')
      setEvmAccount({ ...account, signer: selectedExtension?.signer })
    closeModal()
  }

  useEffect(() => {
    const userAgent = typeof window !== 'undefined' && navigator.userAgent
    if (userAgent) {
      setIsMobile(isMobileDevice(userAgent))
    }
  }, [])

  useEffect(() => {
    if (isModalOpen) {
      setCurrentView('extensions')
      setSelectedExtension(null)
    }
  }, [isModalOpen])

  if (isMobile)
    return (
      <Dialog open={isModalOpen} onOpenChange={open => (open ? openModal() : closeModal())}>
        <WalletNotAccessible />
      </Dialog>
    )

  return (
    <Dialog open={isModalOpen} onOpenChange={open => (open ? openModal() : closeModal())}>
      <DialogContent
        className="m-auto max-h-[85vh] max-w-[25rem] overflow-scroll rounded-4xl border-1 border-black pb-4"
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

        {/* Content */}
        <div className="flex min-h-[130px] flex-col items-center justify-center space-y-2 p-6 text-base">
          {/* Show extensions */}
          {currentView === 'extensions' &&
            (extensions.length > 0 ? (
              extensions.map(extension => (
                <Button
                  key={extension.name}
                  className="flex w-full items-center justify-between rounded-[12px] border-0 bg-turtle-level1 bg-opacity-70 p-4 hover:bg-opacity-95"
                  variant="outline"
                  onClick={() => handleExtensionSelect(extension)}
                >
                  <div className="flex items-center space-x-2 text-sm">
                    <Icon src={getWalletLogo(extension.name)} width={40} height={40} />
                    <span>{getWalletName(extension.name)}</span>
                  </div>
                  <span className="rounded-[5px] bg-turtle-primary-light px-[5px] py-[3px] text-[9px] text-xs font-bold text-turtle-primary-dark text-opacity-80">
                    INSTALLED
                  </span>
                </Button>
              ))
            ) : (
              <p className="text-center text-sm text-turtle-level6">
                <span className="font-bold">Oops!</span>No extensions detected. Please install a
                compatible wallet extension, such as Talisman, Subwallet, or Polkadot.js.
              </p>
            ))}

          {/* Show accounts */}
          {currentView === 'accounts' &&
            (extensionAccounts.length > 0 ? (
              extensionAccounts
                .filter(account =>
                  type === 'SubstrateEVM'
                    ? account.type === 'ethereum'
                    : account.type === 'sr25519',
                )
                .map(account => (
                  <Button
                    key={account.address}
                    className="flex w-full items-center justify-between rounded-[12px] border-0 bg-turtle-level1 bg-opacity-70 p-4 hover:bg-opacity-95"
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
                      CONNECTED
                    </span>
                  </Button>
                ))
            ) : (
              <p className="text-center text-sm text-gray-500">
                No accounts available. Please connect an account to Turtle inside your wallet
                extension.
              </p>
            ))}
        </div>

        {/* Footer */}
        {currentView === 'extensions' && <Footer />}
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
