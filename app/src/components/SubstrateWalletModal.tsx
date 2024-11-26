'use client'
import useSubstrateWallet from '@/hooks/useSubstrateWallet'
import { FC, useState } from 'react'
import Button from './Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'

const SubstrateWalletModal: FC = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [currentView, setCurrentView] = useState<'extensions' | 'accounts'>('extensions')
  const [selectedExtension, setSelectedExtension] = useState<string | null>(null)
  const { isModalOpen, closeModal, openModal, extensions, accounts } = useSubstrateWallet()

  /* useEffect(() => {
    const userAgent = typeof window !== 'undefined' && navigator.userAgent
    if (userAgent) {
      setIsMobile(isMobileDevice(userAgent))
    }
  }, []) */

  const handleExtensionSelect = (extensionName: string) => {
    setSelectedExtension(extensionName)
    setCurrentView('accounts')
  }

  const handleAccountSelect = (accountAddress: string) => {
    console.log(`Selected account: ${accountAddress}`)
    closeModal()
  }

  const handleBack = () => {
    if (currentView === 'accounts') {
      setCurrentView('extensions')
      setSelectedExtension(null)
    }
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={open => (open ? openModal() : closeModal())}>
      <DialogContent
        className="m-auto max-h-[85vh] max-w-[90vw] overflow-scroll rounded-4xl sm:max-w-[30.5rem]"
        hideCloseButton={true}
      >
        {/* Header */}
        <DialogHeader className="flex flex-col items-center justify-center space-y-4 rounded-t-[32px] border border-turtle-secondary-dark bg-turtle-secondary-light py-6">
          <DialogTitle className="text-xl font-semibold text-turtle-secondary-dark">
            {currentView === 'extensions' ? 'Select Wallet' : 'Select Account'}
          </DialogTitle>
          {currentView === 'accounts' && selectedExtension && (
            <Button
              className="absolute left-0 top-0"
              variant="ghost"
              label="Back"
              onClick={handleBack}
            />
          )}
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
                  onClick={() => handleExtensionSelect(extension.name)}
                />
              ))
            ) : (
              <p className="text-center text-sm text-gray-500">
                No extensions detected. Please install a compatible wallet extension.
              </p>
            ))}

          {currentView === 'accounts' &&
            (accounts.length > 0 ? (
              accounts.map(account => (
                <Button
                  key={account.address}
                  className="w-full p-4"
                  variant="outline"
                  label={account.meta.name || account.address}
                  onClick={() => handleAccountSelect(account.address)}
                />
              ))
            ) : (
              <p className="text-center text-sm text-gray-500">
                No accounts available. Please add an account to your selected wallet extension.
              </p>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SubstrateWalletModal
