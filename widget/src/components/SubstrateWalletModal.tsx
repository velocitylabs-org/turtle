import useSubstrateWallet from '@/hooks/useSubstrateWallet'
import { truncateAddress } from '@/utils/address'
import { getWalletLogo, getWalletName, getWalletWeight } from '@/utils/wallet'
import type { InjectedAccount, InjectedExtension } from '@polkadot/extension-inject/types'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { colors } from '../../tailwind.config'
import { Button, LoadingIcon } from '@velocitylabs-org/turtle-ui'
import { Icon } from './Icon'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { ChevronLeft } from 'lucide-react'

const animationDuration = 0.35

const noItemsFoundTransitions = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: animationDuration / 2 } },
  exit: { opacity: 0, transition: { duration: animationDuration / 2 } },
}

const accountsViewTransitions = {
  initial: { x: 5, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: animationDuration / 2, type: 'spring' } },
  exit: { x: 5, opacity: 0, transition: { duration: animationDuration / 2, type: 'spring' } },
}

const headerElementAnimationProps = {
  initial: { opacity: 0, left: 5 },
  animate: { opacity: 1, left: 0 },
  exit: { opacity: 0, left: 5 },
  transition: { delay: animationDuration / 2, duration: 0.1, type: 'tween' },
}

const loadingTransitions = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: animationDuration / 3 } },
  exit: { opacity: 0, transition: { duration: animationDuration / 3 } },
}

export default function SubstrateWalletModal() {
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

  const [enableTranslateAnimation, setEnableTranslateAnimation] = useState(false)

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
    // We just need to run this effect when isModalOpen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen])

  const filteredAccounts = accounts.filter(account =>
    type === 'SubstrateEVM'
      ? account.type === 'ethereum'
      : ['sr25519', 'ed25519'].includes(account.type ?? ''),
  )

  const heightAnimationProps = useMemo(
    () => ({
      initial: { height: currentView === 'extensions' ? '12.5rem' : '14rem' },
      animate: { height: currentView === 'extensions' ? '12.5rem' : '14rem' },
      transition: { duration: animationDuration, type: 'spring' },
    }),
    [currentView],
  )

  const extensionsViewTransitions = useMemo(
    () =>
      enableTranslateAnimation
        ? {
            initial: { x: -10, opacity: 0 },
            animate: {
              x: 0,
              opacity: 1,
              transition: { duration: animationDuration / 2, type: 'spring' },
            },
            exit: {
              x: -10,
              opacity: 0,
              transition: { duration: animationDuration / 2, type: 'spring' },
            },
          }
        : {
            initial: { opacity: 0 },
            animate: {
              opacity: 1,
              transition: { duration: animationDuration / 2 },
            },
            exit: {
              opacity: 0,
              transition: { duration: animationDuration / 2 },
            },
          },
    [enableTranslateAnimation],
  )

  return (
    <Dialog open={isModalOpen} onOpenChange={open => (open ? openModal() : closeModal())}>
      <DialogContent
        className="m-auto max-h-[85vh] max-w-[90vw] rounded-4xl focus:outline-none min-[460px]:max-w-[24rem]"
        hideCloseButton={false}
        overlayProps={{
          className: 'bg-black/70',
        }}
        closeButtonProps={{
          className:
            'top-[18px] right-[18px] focus:ring-0 hover:bg-gray-100 opacity-100 p-1 rounded-[10px]',
          iconClassName: 'h-[18px] w-[18px]',
          iconStrokeWidth: 3,
        }}
      >
        {/* Header */}
        <DialogHeader className="relative flex items-center justify-center rounded-t-4xl p-4">
          {currentView === 'accounts' && (
            <motion.div
              key={currentView}
              {...headerElementAnimationProps}
              className="absolute left-0"
            >
              <Button variant="ghost" size="md" onClick={() => setCurrentView('extensions')}>
                <span className="flex h-[29px] w-[29px] items-center justify-center rounded-[10px] p-[3px] opacity-100 hover:bg-gray-100">
                  <ChevronLeft className="h-5 w-5" strokeWidth={3} />
                </span>
              </Button>
            </motion.div>
          )}
          <DialogTitle className="mt-1 text-base font-bold">
            <AnimatePresence mode="wait">
              {currentView === 'extensions' && (
                <motion.div key="extensionsView" {...extensionsViewTransitions}>
                  Connect Wallet
                </motion.div>
              )}
              {currentView === 'accounts' && (
                <motion.div key="accountsView" {...accountsViewTransitions}>
                  Connect Wallet
                </motion.div>
              )}
            </AnimatePresence>
          </DialogTitle>
        </DialogHeader>

        {/* Animate Height Transition */}
        <motion.div
          className="flex flex-col items-center justify-start space-y-2 overflow-y-auto p-6 pt-2 text-base"
          layout
          {...heightAnimationProps}
        >
          <AnimatePresence mode="wait">
            {/* Loading */}
            {loading && (
              <motion.div
                key="loading"
                {...loadingTransitions}
                className="mb-3 flex h-full w-full items-center justify-center"
              >
                <LoadingIcon
                  className="animate-spin"
                  size="lg"
                  color={colors['turtle-secondary']}
                />
              </motion.div>
            )}

            {currentView === 'extensions' && !loading && (
              <motion.div
                key="extensionsView"
                {...extensionsViewTransitions}
                className="flex w-full flex-1 flex-col"
              >
                {extensions.length > 0 ? (
                  <div className="flex flex-1 flex-col gap-2">
                    {/* Added wrapper div */}
                    {[...extensions]
                      .sort(
                        (a, b) => getWalletWeight(a.name, window) - getWalletWeight(b.name, window),
                      )
                      .map(extension => (
                        <Button
                          key={extension.name}
                          className='flex min-h-12 w-full items-center justify-between rounded-[12px] border-0 bg-[#fafafa] p-4 data-[hover="true"]:bg-[#f6f6f6] data-[hover="true"]:opacity-100'
                          variant="outline"
                          onClick={() => handleExtensionSelect(extension)}
                        >
                          <div className="flex items-center space-x-2 text-sm">
                            <Icon
                              src={getWalletLogo(extension.name, window)}
                              width={40}
                              height={40}
                            />
                            <span className="block max-w-[120px] truncate sm:max-w-[165px]">
                              {getWalletName(extension.name, window)}
                            </span>
                          </div>
                          <span className="rounded-[5px] bg-turtle-primary-light px-[6px] py-[3px] text-[11px] font-bold text-turtle-primary-dark text-opacity-80">
                            INSTALLED
                          </span>
                        </Button>
                      ))}
                  </div>
                ) : (
                  <motion.div
                    {...noItemsFoundTransitions}
                    className="flex h-full w-full items-center justify-center"
                  >
                    <p className="text-center text-sm text-turtle-level6">
                      <span className="font-bold">Oops! </span>No extensions detected. Please
                      install a compatible wallet extension, such as Talisman, Subwallet, or
                      Polkadot.js.
                    </p>
                  </motion.div>
                )}
                <Footer />
              </motion.div>
            )}
            {/* Show accounts */}
            {currentView === 'accounts' && !loading && (
              <motion.div
                key="accountsView"
                {...accountsViewTransitions}
                className="flex w-full flex-1 flex-col"
              >
                {filteredAccounts.length > 0 ? (
                  <div className="flex flex-1 flex-col gap-2">
                    {filteredAccounts.map(account => (
                      <Button
                        key={account.address}
                        className='flex min-h-12 w-full items-center justify-between rounded-[12px] border-0 bg-[#fafafa] p-4 data-[hover="true"]:bg-[#f6f6f6] data-[hover="true"]:opacity-100'
                        variant="outline"
                        onClick={() => handleAccountSelect(account)}
                      >
                        <div className="flex flex-col items-start space-y-1 text-sm">
                          <span className="block max-w-[180px] truncate text-[13px] font-medium sm:max-w-[220px]">
                            {account.name || 'Unnamed Account'}
                          </span>
                          <span className="text-xs text-turtle-level6">
                            {truncateAddress(account.address)}
                          </span>
                        </div>
                        <span className="rounded-[5px] bg-turtle-primary-light px-[6px] py-[3px] text-[11px] font-bold text-turtle-primary-dark text-opacity-80">
                          CONNECT
                        </span>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    {...noItemsFoundTransitions}
                    className="flex h-full w-full items-center justify-center"
                  >
                    <p className="text-center text-sm text-turtle-level6">
                      <span className="font-bold">Oops! </span>No accounts available. Please connect
                      an account to Turtle inside your wallet extension.
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </DialogContent>
      {isModalOpen && (
        <TransitionControl setEnableTranslateAnimation={setEnableTranslateAnimation} />
      )}
    </Dialog>
  )
}

function Footer() {
  return (
    <div className="text mt-7 text-center text-[12px] leading-[13px] text-gray-500">
      Haven&apos;t got a wallet?
      <a
        href="https://support.polkadot.network/support/solutions/articles/65000098878-how-to-create-a-polkadot-account"
        className="ml-2 font-bold text-blue-500"
      >
        Get started
      </a>
    </div>
  )
}

// Prevent initial animation on component mount to avoid visual glitches.
// Animations are only triggered after the modal opens for a smoother user experience.
function TransitionControl({
  setEnableTranslateAnimation,
}: {
  setEnableTranslateAnimation: (v: boolean) => void
}) {
  useEffect(() => {
    setTimeout(() => setEnableTranslateAnimation(true), 400)
    return () => setEnableTranslateAnimation(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}
