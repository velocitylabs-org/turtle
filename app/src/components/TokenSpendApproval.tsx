import { cn } from '@/utils/cn'
import Image from 'next/image'
import { FC } from 'react'

interface Props {
  onClick: () => void
  /* Whether the user is signing the token spend approval */
  approving: boolean
}

const TokenSpendApproval: FC<Props> = ({ onClick, approving }) => {
  return (
    <div
      className={cn(
        'mt-8 rounded-[20px] bg-turtle-secondary-light px-3 py-5',
        approving ? 'animate-pulse' : '',
      )}
    >
      <div className="justify-items flex flex-row items-start">
        <Image src={'/wallet.svg'} alt={'Wallet illustration'} width={64} height={64} />
        <div className="justify-left ml-3 flex flex-col">
          <div className="text-left text-small font-bold text-turtle-foreground">
            Approve ERC-20 token spend
          </div>
          <div className="pb-2 text-left text-small text-turtle-foreground">
            We first need your approval to transfer this token from your wallet.
            <button
              className="ml-1 text-left text-small text-turtle-foreground underline"
              onClick={onClick}
              disabled={approving}
            >
              Sign now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TokenSpendApproval
