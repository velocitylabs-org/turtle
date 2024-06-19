'use client'
import { Transfer } from '@/models/transfer'
import { truncateAddress } from '@/utils/address'
import { FC } from 'react'

const OngoingTransfer: FC<Transfer> = (transfer: Transfer) => {
  return (
    <div>
      <div className="mt-8 flex w-full flex-col gap-2  rounded-[24px] border-1 border-black bg-white p-[2.5rem] backdrop-blur-sm sm:min-w-[31.5rem]">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-normal">
            <span className="font-bold">Step 1 of 1</span> {transfer.status}
          </span>
          <span className="text-normal text-[color:var(--turtle-level5)]">{transfer.date}</span>
        </div>
        <div className="mb-4 h-1.5 w-full rounded-full bg-gray-200">
          <div className="h-1.5 rounded-full bg-purple-500" style={{ width: '66%' }}></div>
        </div>

        {/* Details box */}
        <div className="mb-4 flex justify-between rounded-[16px] border border-[color:var(--turtle-secondary)] bg-[color:var(--turtle-secondary-light)] p-[24px]">
          <div className="mb-2 flex grow flex-row">
            <div className="flex items-center p-3">
              <i className="fas fa-sync-alt mr-2 animate-spin text-[30px] text-[color:var(--turtle-secondary)]"></i>
            </div>

            <div className="flex grow flex-col justify-between">
              <div className="items-left mb-2 flex flex-row justify-between ">
                <span className="text-2xl text-[color:var(--turtle-secondary-dark)]">
                  {transfer.amount} {transfer.token.symbol}{' '}
                </span>
                <span className="text-normal text-[color:var(--turtle-secondary)]">8:32 am</span>
              </div>
              <div className="mb-2 flex items-center text-[color:var(--turtle-secondary-dark)]">
                <span className="text-sm">{truncateAddress(transfer.sender, 4, 4)}</span>
                <i className="fas fa-arrow-right mx-2"></i>
                <span className="text-sm">{truncateAddress(transfer.recipient, 4, 4)}</span>
              </div>
              <div className="text-sm text-[color:var(--turtle-secondary-dark)]">
                This transaction is in progress.{' '}
                <a href="#" className="underline">
                  See more
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OngoingTransfer
