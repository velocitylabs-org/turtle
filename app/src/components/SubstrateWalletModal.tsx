'use client'
import useSubstrateWallet from '@/hooks/useSubstrateWallet'
import { isMobileDevice } from '@/utils/env'
import { getWalletLogo, getWalletName } from '@/utils/wallet'
import type { InjectedAccount, InjectedExtension } from '@polkadot/extension-inject/types'
import Image from 'next/image'
import { FC, useEffect, useState } from 'react'
import Button from './Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { WalletNotAccessible } from './WalletNotAccessible'

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
        className="m-auto max-h-[85vh] max-w-[25rem] overflow-scroll rounded-4xl pb-4"
        hideCloseButton={true}
      >
        {/* Header */}
        <DialogHeader className="flex items-center justify-between rounded-t-4xl bg-turtle-level2 p-4">
          <DialogTitle className="text-lg font-bold">
            {currentView === 'extensions' ? 'Connect Wallet' : 'Connect Account'}
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="space-y-4 p-6">
          {currentView === 'extensions' &&
            (extensions.length > 0 ? (
              extensions.map(extension => (
                <Button
                  key={extension.name}
                  className="flex w-full items-center justify-between rounded-md border bg-gray-50 p-4 hover:bg-gray-100"
                  variant="outline"
                  onClick={() => handleExtensionSelect(extension)}
                >
                  <div className="flex items-center space-x-2">
                    <Image
                      src={getWalletLogo(extension.name)}
                      alt={`${extension.name} Logo`}
                      width={64}
                      height={64}
                      className="h-8 w-8"
                    />
                    <span>{getWalletName(extension.name)}</span>
                  </div>
                  <span className="text-sm text-turtle-primary-dark">Installed</span>
                </Button>
              ))
            ) : (
              <p className="text-center text-sm text-gray-500">
                No extensions detected. Please install a compatible wallet extension, such as
                Talisman, Subwallet, or Polkadot.js.
              </p>
            ))}
        </div>

        {/* Footer */}
        {currentView === 'extensions' && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Haven&apos;t got a wallet?{' '}
            <a
              href="https://support.polkadot.network/support/solutions/articles/65000098878-how-to-create-a-polkadot-account"
              className="text-blue-500"
            >
              Get started
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default SubstrateWalletModal

/* {
  currentView === 'accounts' &&
    (extensionAccounts.length > 0 ? (
      extensionAccounts
        .filter(account =>
          type === 'SubstrateEVM' ? account.type === 'ethereum' : account.type === 'sr25519',
        )
        .map(account => (
          <Button
            key={account.address}
            className="flex w-full flex-col"
            variant="outline"
            onClick={() => handleAccountSelect(account)}
          >
            <span className="pt-3">{account.name}</span>
            <span className="pb-4 text-xs text-turtle-level6">
              {truncateAddress(account.address)}
            </span>
          </Button>
        ))
    ) : (
      <p className="text-center text-sm text-gray-500">
        No accounts available. Please connect an account to Turtle inside your wallet extension.
      </p>
    ))
} */
