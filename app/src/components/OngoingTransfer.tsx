import { FC } from 'react'
import Image from 'next/image'
import { StoredTransfer } from '@/models/transfer'
import { SnowbridgeStatus } from '@/models/snowbridge'
import { Direction } from '@/services/transfer'
import { formatOngoingTransferDate } from '@/utils/datetime'
import { formatAmount, toHuman } from '@/utils/transfer'
import Account from './Account'
import { ArrowRight } from './svg/ArrowRight'
import TransferEstimate from './TransferEstimate'
import LoadingIcon from './svg/LoadingIcon'
import { colors } from '../../tailwind.config'

const OngoingTransfer: FC<{
  direction: Direction
  transfer: StoredTransfer
  transferStatus: string | null
  estimatedTransferDuration?: SnowbridgeStatus
}> = ({ direction, transfer, transferStatus, estimatedTransferDuration }) => {
  return (
    <div className="mb-2 rounded-[16px] border border-turtle-level3 p-3 hover:cursor-pointer">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-left font-bold text-turtle-secondary-dark">{transferStatus ?? ''}</p>
        <p className="text-normal text-right text-turtle-secondary">
          {formatOngoingTransferDate(transfer.date)}
        </p>
      </div>

      <TransferEstimate
        transfer={transfer}
        direction={direction}
        outlinedProgressBar={false}
        estimatedTransferDuration={estimatedTransferDuration}
      />

      <div className="mb-2 flex items-center">
        <LoadingIcon
          className="mr-2 animate-spin"
          width={24}
          height={24}
          strokeWidth={5}
          color={colors['turtle-secondary']}
        />
        <p className="text-turtle-foreground)] no-letter-spacing text-xl font-normal">
          {formatAmount(toHuman(transfer.amount, transfer.token))} {transfer.token.symbol}
        </p>
        {/* From and to Chains */}
        <div className="ml-2 flex h-[24px] items-center space-x-1 rounded-full border border-turtle-level3 p-1">
          <Image
            src={transfer.sourceChain.logoURI}
            alt="Source Chain"
            width={16}
            height={16}
            className="h-[16px] rounded-full border border-turtle-secondary-dark"
          />
          <ArrowRight className="h-[0.45rem] w-[0.45rem]" fill={colors['turtle-secondary-dark']} />
          <Image
            src={transfer.destChain.logoURI}
            alt="Destination Chain"
            width={16}
            height={16}
            className="h-[16px] w-4 rounded-full border border-turtle-secondary-dark"
          />
        </div>
      </div>

      <div className="flex items-center">
        <Account
          network={transfer.sourceChain.network}
          address={transfer.sender}
          allowCopy={false}
        />
        <ArrowRight className="mx-3 h-[0.8rem] w-[0.8rem]" fill={colors['turtle-secondary-dark']} />
        <Account
          network={transfer.destChain.network}
          address={transfer.recipient}
          allowCopy={false}
        />
      </div>
    </div>
  )
}

export default OngoingTransfer
