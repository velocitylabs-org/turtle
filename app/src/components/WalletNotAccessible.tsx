import { cn } from '@/utils/cn'
import Image from 'next/image'
import { useState } from 'react'

export const WalletNotAccessible = () => {
  const [displayWalletNote, setDisplayWalletNote] = useState<boolean>(true)
  return (
    displayWalletNote && (
      <div className={cn('-mt-8 rounded-[20px] bg-turtle-secondary-light p-3 lg:hidden')}>
        <div className="justify-items flex flex-row items-center">
          <Image src={'/wallet.svg'} alt={'Wallet illustration'} width={64} height={64} />
          <div className="justify-left ml-3 flex flex-col">
            <div className="text-left text-small font-bold text-turtle-foreground">
              Connection information
            </div>
            <div className="flex flex-col items-start pb-2 text-small text-turtle-foreground">
              <p>
                Your wallet might not be fully supported on mobile yet. Connect on desktop or use a
                wallet partner like{' '}
                <a
                  href="https://novawallet.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer font-medium"
                >
                  Nova Wallet
                </a>{' '}
                or{' '}
                <a
                  href="https://www.subwallet.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer font-medium"
                >
                  SubWallet
                </a>
              </p>

              <button
                className={cn(' text-turtle-foreground underline')}
                onClick={() => {
                  setDisplayWalletNote(!displayWalletNote)
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  )
}
