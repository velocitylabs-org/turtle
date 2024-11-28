'use client'
import useSubstrateWallet from '@/hooks/useSubstrateWallet'
import { isMobileDevice } from '@/utils/env'
import type { InjectedAccount, InjectedExtension } from '@polkadot/extension-inject/types'
import { FC, useEffect, useState } from 'react'
import Button from './Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { WalletNotAccessible } from './WalletNotAccessible'

const SubstrateWalletModal: FC = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [selectedExtension, setSelectedExtension] = useState<InjectedExtension | null>(null)
  const [extensionAccounts, setExtensionAccounts] = useState<InjectedAccount[]>([])
  const [currentView, setCurrentView] = useState<'extensions' | 'accounts'>('extensions') // Current view state
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
        className="m-auto max-h-[85vh] max-w-[90vw] overflow-scroll rounded-4xl sm:max-w-[30.5rem]"
        hideCloseButton={true}
      >
        {/* Header */}
        <DialogHeader className="flex items-center justify-center rounded-t-[32px] border border-turtle-secondary-dark bg-turtle-secondary-light py-6">
          <DialogTitle className="text-xl font-semibold text-turtle-secondary-dark">
            {currentView === 'extensions' ? 'Select Wallet' : 'Select Account'}
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="space-y-4 p-6">
          {currentView === 'extensions' &&
            (extensions.length > 0 ? (
              extensions.map(extension => (
                <Button
                  key={extension.name}
                  className="w-full p-4"
                  variant="outline"
                  label={extension.name}
                  onClick={() => handleExtensionSelect(extension)}
                />
              ))
            ) : (
              <p className="text-center text-sm text-gray-500">
                No extensions detected. Please install a compatible wallet extension. For example,
                Talisman, Subwallet, or Polkadot.js.
              </p>
            ))}

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
                    className="w-full p-4"
                    variant="outline"
                    label={account.name || account.address}
                    onClick={() => handleAccountSelect(account)}
                  />
                ))
            ) : (
              <p className="text-center text-sm text-gray-500">
                No accounts available. Please connect an account to Turtle inside your wallet
                extension.
              </p>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SubstrateWalletModal
