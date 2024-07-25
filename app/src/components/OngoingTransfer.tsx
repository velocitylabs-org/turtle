'use client'
import { FC } from 'react'
import Image from 'next/image'

import { StoredTransfer } from '@/models/transfer'
import { truncateAddress } from '@/utils/address'
import { formatOngoingTransferDate } from '@/utils/datetime'
import { formatAmount, toHuman } from '@/utils/transfer'
import { cn } from '@/utils/cn'

import { ArrowRight } from './svg/ArrowRight'
import LoadingIcon from './svg/LoadingIcon'

import { colors } from '../../tailwind.config'

const OngoingTransfer: FC<{
  transfer: StoredTransfer
  update: string | null
  progression: number
}> = ({ transfer, update, progression }) => {
  return (
    <div className="mb-2 rounded-[16px] border border-turtle-level3 p-3 hover:cursor-pointer">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-left font-bold text-turtle-secondary-dark">{update ?? ''}</p>
        <p className="text-normal text-right text-turtle-secondary">
          {formatOngoingTransferDate(transfer.date)}
        </p>
      </div>
      {/* Progress bar */}
      <div
        className={cn(
          'mb-4 h-2 rounded-full bg-turtle-secondary-light',
          progression <= 0 && 'animate-pulse',
        )}
      >
        {progression > 0 && (
          <div
            className="h-full rounded-full border border-turtle-secondary-dark bg-turtle-secondary transition-all duration-700 ease-in-out"
            style={{ width: `${progression}%` }}
          />
        )}
      </div>
      <div className="mb-2 flex items-center">
        <LoadingIcon
          className="mr-2 animate-spin"
          width={24}
          height={24}
          strokeWidth={5}
          color={colors['turtle-secondary']}
        />
        <p className="text-turtle-foreground)] text-xl font-normal">
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
        <div className="mr-1 h-4 w-4 rounded-full border border-turtle-secondary-dark bg-gradient-to-r from-violet-400 to-purple-300" />
        <p className="text-turtle-foreground)]">{truncateAddress(transfer.sender, 4, 4)}</p>
        <i className="fas fa-arrow-right mx-2 p-1.5 text-lg text-turtle-secondary-dark"></i>
        <div className="mr-1 h-4 w-4 rounded-full border border-turtle-secondary-dark bg-gradient-to-r from-violet-400 to-purple-300" />
        <p className="text-turtle-foreground)]">{truncateAddress(transfer.recipient, 4, 4)}</p>
      </div>
    </div>
  )
}

export default OngoingTransfer
