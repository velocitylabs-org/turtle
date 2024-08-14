import { cn } from '@/utils/cn'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
// import Button from './Button'

export const WalletNotAccessible = ({
  disabled,
  isConnected,
  onClick,
}: {
  disabled: boolean
  isConnected: boolean
  onClick?: () => void
}) => {
  return (
    <Dialog>
      <DialogTrigger className="w-full lg:hidden" asChild>
        <div
          onClick={onClick}
          className={cn(
            'opacity-1 z-0 flex h-[1.625rem] items-center justify-center gap-2 rounded-lg border border-black bg-turtle-primary px-2 py-0 text-sm text-black',
            disabled && 'opacity-30',
          )}
        >
          {isConnected ? 'Disconnect' : 'Connect'}
        </div>
        {/* <Button
          label={isConnected ? 'Disconnect' : 'Connect'}
          variant={isConnected ? 'outline' : 'primary'}
          disabled={disabled}
          size="sm"
          className={cn('text-sm')}
          onClick={onClick}
        /> */}
      </DialogTrigger>
      <DialogContent
        className="m-auto max-h-[85vh] max-w-[85vw] overflow-scroll rounded-4xl sm:max-w-[30.5rem]"
        // hideCloseButton={true}
      >
        <DialogHeader
          className={cn(
            'flex flex-col items-center justify-center space-y-6 rounded-t-[32px] border border-turtle-secondary bg-turtle-secondary-light py-5 sm:py-10',
          )}
        >
          {/* Not displayed on the modal */}
          <DialogTitle className="sr-only">Connect Wallet not available on mobile</DialogTitle>
          {/* Not displayed on the modal */}
          <DialogDescription className="sr-only">
            Use known Polkadot App Wallets to enjoy Turtle frictionless cross-chain transfers.
          </DialogDescription>
          <div className={cn('flex w-2/3 items-center justify-center space-x-4')}>
            Polkadot wallet connection not available.
          </div>
        </DialogHeader>

        {/* Modal content */}
        <div
          className={cn(
            'flex w-full flex-1 flex-col items-center gap-4 rounded-b-4xl border border-x-turtle-secondary border-b-turtle-secondary bg-white p-4 sm:p-10',
          )}
        >
          <div>
            Enjoy a seamless experience from desktop or in the app section of our know Wallet
            partners. Turtle recommand using either Sub Wallet or Nova Wallet.
          </div>
          <div>
            <p>Get your Wallet now and start enjoying Turtle frictionless cross-chain transfers:</p>
            <div></div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
