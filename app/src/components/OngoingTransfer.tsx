'use client'
import { FC } from 'react'

// /*

// Model

// - Current step
// - Date
// - Source chain
// - Source wallet
// - Dest chain
// - Recipient
// - Amount
// - Token

// */

interface Props {
  token: string
}

const OngoingTransfers: FC<Props> = props => {
  return (
    <div>
      <div className="mt-8 flex w-full flex-col gap-2  rounded-[24px] border-1 border-black bg-white p-[2.5rem] backdrop-blur-sm sm:min-w-[31.5rem]">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-normal">
            <span className="font-bold">Step x of y</span> Arrived at AssetHub
          </span>
          <span className="text-normal text-[color:var(--turtle-level5)]">Today 1:38 pm</span>
        </div>
        <div className="mb-4 h-1.5 w-full rounded-full bg-gray-200">
          <div className="h-1.5 rounded-full bg-purple-500" style={{ width: '66%' }}></div>
        </div>

        {/* Details box */}
        <div className="mb-4 flex justify-between rounded-[16px] border border-[color:var(--turtle-secondary)] bg-[color:var(--turtle-secondary-light)] p-[24px]">
          <div className="mb-2 flex grow flex-row">
            <div className="flex items-center p-3">
              <i className="fas fa-sync-alt mr-2 text-[30px] text-[color:var(--turtle-secondary)]"></i>
            </div>

            <div className="flex grow flex-col justify-between">
              <div className="items-left mb-2 flex flex-row justify-between ">
                <span className="text-2xl text-[color:var(--turtle-secondary-dark)]">
                  542.312 {props.token}{' '}
                </span>
                <span className="text-normal text-[color:var(--turtle-secondary)]">8:32 am</span>
              </div>
              <div className="mb-2 flex items-center text-[color:var(--turtle-secondary-dark)]">
                <span className="text-sm">brandonhaslegs.eth</span>
                <i className="fas fa-arrow-right mx-2"></i>
                <span className="text-sm">0x0f17-2h97</span>
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
        <button className="w-full rounded-lg border border-gray-300 bg-white py-2 text-center text-lg text-gray-700 hover:bg-gray-100">
          View completed transactions <i className="fas fa-arrow-right ml-1"></i>
        </button>
      </div>
    </div>
  )
}

export default OngoingTransfers
