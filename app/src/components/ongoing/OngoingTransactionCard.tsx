import type { Token } from '@velocitylabs-org/turtle-registry'
import { colors } from '@velocitylabs-org/turtle-tailwind-config'
import { TokenLogo } from '@velocitylabs-org/turtle-ui'
import Image from 'next/image'
import type { StoredTransfer } from '@/models/transfer'
import type { Direction } from '@/services/transfer'
import { isChainflipSwap } from '@/utils/chainflip'
import { formatOngoingTransferDate } from '@/utils/datetime'
import { formatAmount, isSwap, toHuman } from '@/utils/transfer'
import Account from '../Account'
import ArrowRight from '../svg/ArrowRight'
import LoadingIcon from '../svg/LoadingIcon'
import TransferEstimate from '../TransferEstimate'

interface OngoingTransactionCardProps {
  direction: Direction
  transfer: StoredTransfer
  status: string
}

export default function OngoingTransactionCard({ direction, transfer, status }: OngoingTransactionCardProps) {
  return (
    <div className="mb-2 rounded-[16px] border border-turtle-level3 p-3 hover:cursor-pointer">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-left font-bold text-turtle-secondary-dark">{status}</p>
        <p className="text-normal text-right text-turtle-secondary">{formatOngoingTransferDate(transfer.date)}</p>
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
        <div className="no-letter-spacing text-xl font-normal text-turtle-foreground">
          {isSwap(transfer) ||
          isChainflipSwap(transfer.sourceChain, transfer.destChain, transfer.sourceToken, transfer.destinationToken) ? (
            <span className="flex items-center gap-1">
              {formatAmount(toHuman(transfer.destinationAmount as string, transfer.destinationToken as Token))}{' '}
              <TokenLogo token={transfer.destinationToken as Token} sourceChain={transfer.destChain} size={25} />
            </span>
          ) : (
            <span className="flex items-center gap-1">
              {formatAmount(toHuman(transfer.sourceAmount, transfer.sourceToken))}{' '}
              <TokenLogo token={transfer.sourceToken} sourceChain={transfer.sourceChain} size={25} />
            </span>
          )}
        </div>

        {/* From and to Chains */}
        <div className="ml-2 flex h-[24px] items-center space-x-1 rounded-full border border-turtle-level3 p-1">
          <Image
            src={(transfer.sourceChain.logoURI as Record<string, string>).src}
            alt="Source Chain"
            width={16}
            height={16}
            className="h-[16px] rounded-full border border-turtle-secondary-dark bg-turtle-background"
          />
          <ArrowRight className="h-[0.45rem] w-[0.45rem]" fill={colors['turtle-secondary-dark']} />
          <Image
            src={(transfer.destChain.logoURI as Record<string, string>).src}
            alt="Destination Chain"
            width={16}
            height={16}
            className="h-[16px] w-4 rounded-full border border-turtle-secondary-dark bg-turtle-background"
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
