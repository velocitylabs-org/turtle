import { colors } from '@velocitylabs-org/turtle-tailwind-config'
import { TokenLogo } from '@velocitylabs-org/turtle-ui'
import Image from 'next/image'
import type { StoredTransfer } from '@/models/transfer'
import type { Direction } from '@/services/transfer'
import { formatOngoingTransferDate } from '@/utils/datetime'
import { formatAmount, toHuman } from '@/utils/transfer'
import ArrowRight from '../svg/ArrowRight'
import LoadingIcon from '../svg/LoadingIcon'
import TransferEstimate from '../TransferEstimate'

interface OngoingTransactionCardProps {
  direction: Direction
  tx: StoredTransfer
  status: string
}

export default function OngoingTransactionCard({ direction, tx, status }: OngoingTransactionCardProps) {
  const sourceAmount = toHuman(tx.sourceAmount, tx.sourceToken)
  const destAmount = toHuman(tx.destinationAmount ?? tx.sourceAmount, tx.destinationToken ?? tx.sourceToken)

  return (
    <div className="group mb-3 rounded-[16px] border border-turtle-level5 p-4 hover:cursor-pointer transition duration-200 ease-in hover:border-turtle-secondary-dark hover:bg-turtle-secondary-light">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex gap-[6px] items-center">
          <div className="flex items-center justify-center border border-turtle-secondary-dark rounded-[4px] w-[20px] h-[20px]">
            <LoadingIcon className="animate-spin" width={14} height={10} color={colors['turtle-secondary-dark']} />
          </div>
          <p className="text-left font-bold text-turtle-secondary-dark">{status}</p>
        </div>
        <p className="text-[10px] text-right sm:block sm:text-sm text-turtle-level5 group-hover:text-turtle-level6">
          {formatOngoingTransferDate(tx.date)}
        </p>
      </div>
      <TransferEstimate transfer={tx} direction={direction} outlinedProgressBar={false} />

      <div className={'flex items-center justify-between space-x-4 mt-4'}>
        {/* Source Token */}
        <div className="flex p-2 items-center bg-turtle-level1 border border-turtle-level5 p-2 gap-2 rounded-lg w-[160px] h-[48px] justify-center group-hover:bg-turtle-background group-hover:border-turtle-secondary-dark">
          <TokenLogo token={tx.sourceToken} sourceChain={tx.sourceChain} />
          {/* Amount token & dolar */}
          <div className="flex flex-col justify-start items-left gap-1 text-left pl-1">
            <div className="text-xl leading-none">{formatAmount(sourceAmount)}</div>
            <div className="text-xs text-turtle-level6 leading-none">
              ${formatAmount((tx.sourceTokenUSDValue ?? 0) * sourceAmount)}
            </div>
          </div>
        </div>

        {/* Source -> Dest Chain */}
        <div className="flex justify-between items-center gap-[3px]">
          <Image
            src={(tx.sourceChain.logoURI as Record<string, string>).src}
            alt={tx.sourceChain.name}
            width={16}
            height={16}
            priority
            className="h-[1rem] w-[1rem] rounded-full border border-turtle-foreground bg-turtle-background"
          />
          <div className="flex items-center justify-center w-[16px]">
            <ArrowRight className="h-3 w-3" fill={colors['turtle-foreground']} />
          </div>
          <Image
            src={(tx.destChain.logoURI as Record<string, string>).src}
            alt={tx.destChain.name}
            width={16}
            height={16}
            priority
            className="h-[1rem] w-[1rem] rounded-full border border-turtle-foreground bg-turtle-background"
          />
        </div>

        {/* Dest Token */}
        <div className="flex p-2 items-center bg-turtle-level1 border border-turtle-level5 p-2 gap-2 rounded-lg w-[160px] h-[48px] justify-center group-hover:bg-turtle-background group-hover:border-turtle-secondary-dark">
          <TokenLogo token={tx.destinationToken ?? tx.sourceToken} sourceChain={tx.destChain} />
          {/* Amount token & dolar */}
          <div className="flex flex-col justify-start items-left gap-1 text-left pl-1">
            <div className="text-xl leading-none">{formatAmount(destAmount)}</div>
            <div className="text-xs text-turtle-level6 leading-none">
              ${formatAmount((tx.destinationTokenUSDValue ?? 0) * destAmount)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
