'use client'
import { FC, useEffect, useState } from 'react'

import { StoredTransfer } from '@/models/transfer'
import { formatDate, toHuman } from '@/utils/transfer'
import Image from 'next/image'

const OngoingTransfer: FC<{
  transfer: StoredTransfer
  update: string | null
  senderDisplay: string
  recipientDisplay: string
}> = ({ transfer, update, senderDisplay, recipientDisplay }) => {
  return (
    <div className="mb-2 rounded-[16px] border border-turtle-level3 p-3 hover:cursor-pointer">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-bold text-turtle-secondary-dark">{update ?? ''}</p>
        <p className="text-normal text-turtle-secondary">{formatDate(transfer.date)}</p>
      </div>
      {/* Progress bar */}
      <div className="mb-4 h-2 rounded-full bg-turtle-secondary-light">
        <div
          className="h-2 rounded-full border border-turtle-secondary-dark bg-turtle-secondary"
          style={{ width: '60%' }}
        />
      </div>
      <div className="mb-2 flex items-center">
        <i className="fas fa-sync-alt mr-3 animate-[spin_3s_infinite] text-lg font-light text-turtle-secondary" />
        <p className="text-turtle-foreground)] text-xl font-normal">
          {toHuman(transfer.amount, transfer.token)} {transfer.token.symbol}
        </p>
        {/* From and to Chains */}
        <div className="ml-2 flex h-[24px] items-center rounded-full border border-turtle-level3 p-1">
          <Image
            src={transfer.sourceChain.logoURI}
            alt="Source Chain"
            width={16}
            height={16}
            className="h-[16px] rounded-full border border-turtle-secondary-dark"
          />
          <i className="fas fa-arrow-right p-1.5 text-xs text-turtle-secondary-dark" />
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
        <Image
          src="https://placehold.co/16x16"
          alt="User avatar"
          width={16}
          height={16}
          className="mr-1 h-[16px] rounded-full border border-turtle-secondary-dark"
        />
        <p className="text-turtle-foreground)]">{senderDisplay}</p>
        <i className="fas fa-arrow-right mx-2 p-1.5 text-lg text-turtle-secondary-dark"></i>
        <Image
          src="https://placehold.co/16x16"
          alt="User avatar"
          width={16}
          height={16}
          className="mr-1 h-[16px] rounded-full border border-turtle-secondary-dark"
        />
        <p className="text-turtle-foreground)]">{recipientDisplay}</p>
      </div>
    </div>
  )
}

export default OngoingTransfer
