'use client'
import { FC } from 'react'
import OngoingTransfer from './OngoingTransfer'
import useOngoingTransfers from '@/hooks/useOngoingTransfers'

const OngoingTransfers: FC = () => {
  const { ongoingTransfers } = useOngoingTransfers()

  const handleViewCompleted = () => {
    // TODO(nuno)
  }

  return (
    <div>
      {ongoingTransfers.length > 0 && (
        <div className="my-20">
          <div className="self-center text-center text-3xl tracking-tight text-black">
            In Progress
          </div>
          <div className="mt-8 flex w-full flex-col gap-2 rounded-[24px] bg-white p-[2.5rem] shadow-[0_2px_16px_0px_#00000026] sm:min-w-[31.5rem]">
            {ongoingTransfers.map(tx => (
              <OngoingTransfer key={tx.id} transfer={tx} />
            ))}

            <button
              onClick={handleViewCompleted}
              className="text-turtle-foreground)] w-full rounded-[8px] border border-turtle-level3 py-[8px] text-center text-lg text-xl"
            >
              View completed transactions <i className="fas fa-arrow-right ml-1"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default OngoingTransfers
