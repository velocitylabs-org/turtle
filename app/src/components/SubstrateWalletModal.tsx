'use client'
import useSubstrateWallet from '@/hooks/useSubstrateWallet'
import type { InjectedAccountWithMeta, InjectedExtension } from '@polkadot/extension-inject/types'
import { FC, useState } from 'react'
import Button from './Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'

const SubstrateWalletModal: FC = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [selectedExtension, setSelectedExtension] = useState<InjectedExtension | null>(null)
  const {
    isModalOpen,
    closeModal,
    openModal,
    extensions,
    accounts,
    type,
    setSubstrateAccount,
    setEvmAccount,
  } = useSubstrateWallet()

  const handleExtensionSelect = (extension: InjectedExtension) => {
    setSelectedExtension(extension)
  }

  const handleAccountSelect = async (account: InjectedAccountWithMeta) => {
    if (type === 'Substrate') setSubstrateAccount({ ...account, signer: selectedExtension?.signer })
    else if (type === 'SubstrateEVM')
      setEvmAccount({ ...account, signer: selectedExtension?.signer })
    closeModal()
  }

  const handleBack = () => {
    setSelectedExtension(null)
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
            {!selectedExtension ? 'Select Wallet' : 'Select Account'}
          </DialogTitle>
          {selectedExtension && (
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
          {!selectedExtension &&
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
                No extensions detected. Please install a compatible wallet extension.
              </p>
            ))}

          {selectedExtension &&
            (accounts.length > 0 ? (
              accounts
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
                    label={account.meta.name || account.address}
                    onClick={() => handleAccountSelect(account)}
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

/* useEffect(() => {
    const userAgent = typeof window !== 'undefined' && navigator.userAgent
    if (userAgent) {
      setIsMobile(isMobileDevice(userAgent))
    }
  }, []) */
