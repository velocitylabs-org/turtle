import { StoredTransfer } from '@/models/transfer'
import { Direction } from '@/services/transfer'
import { formatOngoingTransferDate } from '@/utils/datetime'
import { formatAmount, isSwapTransfer, toHuman } from '@/utils/transfer'
import Image from 'next/image'
import { colors } from '../../../tailwind.config'
import Account from '../Account'
import ArrowRight from '../svg/ArrowRight'
import LoadingIcon from '../svg/LoadingIcon'
import TransferEstimate from '../TransferEstimate'

interface OngoingTransferProps {
  direction: Direction
  transfer: StoredTransfer
  status: string
}

export default function OngoingTransfer({ direction, transfer, status }: OngoingTransferProps) {
  return (
    <div className="mb-2 rounded-[16px] border border-turtle-level3 p-3 hover:cursor-pointer">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-left font-bold text-turtle-secondary-dark">{status}</p>
        <p className="text-normal text-right text-turtle-secondary">
          {formatOngoingTransferDate(transfer.date)}
        </p>
      </div>
      <TransferEstimate transfer={transfer} direction={direction} outlinedProgressBar={false} />
      <div className="mb-2 flex items-center">
        <LoadingIcon
          className="mr-2 animate-spin"
          width={24}
          height={24}
          strokeWidth={5}
          color={colors['turtle-secondary']}
        />
        <p className="text-turtle-foreground)] no-letter-spacing text-xl font-normal">
          {formatAmount(toHuman(transfer.sourceAmount, transfer.sourceToken))}{' '}
          {transfer.sourceToken.symbol}
          {isSwapTransfer(transfer) && (
            <>
              {' '}
              <ArrowRight
                className="mx-1 inline h-3 w-3"
                fill={colors['turtle-secondary-dark']}
              />{' '}
              {formatAmount(toHuman(transfer.destinationAmount, transfer.destinationToken))}{' '}
              {transfer.destinationToken.symbol}
            </>
          )}
        </p>
        {/* From and to Chains */}
        <div className="ml-2 flex h-[24px] items-center space-x-1 rounded-full border border-turtle-level3 p-1">
          <Image
            src={transfer.sourceChain.logoURI}
            alt="Source Chain"
            width={16}
            height={16}
            className="h-[16px] rounded-full border border-turtle-secondary-dark bg-background"
          />
          <ArrowRight className="h-[0.45rem] w-[0.45rem]" fill={colors['turtle-secondary-dark']} />
          <Image
            src={transfer.destChain.logoURI}
            alt="Destination Chain"
            width={16}
            height={16}
            className="h-[16px] w-4 rounded-full border border-turtle-secondary-dark bg-background"
          />
        </div>
      </div>

      <div className="flex items-center">
        <Account
          network={transfer.sourceChain.network}
          addressType={transfer.sourceChain.supportedAddressTypes?.at(0)}
          address={transfer.sender}
          allowCopy={false}
        />
        <ArrowRight className="mx-3 h-[0.8rem] w-[0.8rem]" fill={colors['turtle-secondary-dark']} />
        <Account
          network={transfer.destChain.network}
          addressType={transfer.destChain.supportedAddressTypes?.at(0)}
          address={transfer.recipient}
          allowCopy={false}
        />
      </div>
    </div>
  )
}
