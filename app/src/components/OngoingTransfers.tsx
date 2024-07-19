'use client'

import useStore from '@/hooks/useStore'
import { DisplaysTransfers } from '@/models/transfer'
import { useOngoingTransfersStore } from '@/store/ongoingTransfersStore'

import OngoingTransferDialog from './OngoingTransferDialog'

const OngoingTransfers = ({
  isNewTransaction,
  setIsNewTransaction,
  isCompletedTransactions,
}: DisplaysTransfers) => {
  const ongoingTransfers = useStore(useOngoingTransfersStore, state => state.transfers)

  return (
    <div>
      {ongoingTransfers && ongoingTransfers.length > 0 && (
        <div className="my-20">
          <div className="self-center text-center text-3xl tracking-tight text-black">
            In Progress
          </div>
          <div className="mt-8 flex w-full flex-col gap-2 rounded-[24px] bg-white p-[2.5rem] shadow-[0_2px_16px_0px_#00000026] px-[1.5rem] py-[2rem] sm:p-[2.5rem]">
            {ongoingTransfers.map(tx => (
              <OngoingTransferDialog key={tx.id} transfer={tx} />
            ))}

            {isCompletedTransactions && (
              <button
                onClick={() => isNewTransaction && setIsNewTransaction(!isNewTransaction)}
                disabled={!isCompletedTransactions}
                className="text-turtle-foreground)] w-full rounded-[8px] border border-turtle-level3 py-[8px] text-center text-lg"
              >
                View completed transactions <i className="fas fa-arrow-right ml-1"></i>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default OngoingTransfers
