import { CompletedTransfer } from '@/models/transfer'
import { formatCompletedTransferDate } from '@/utils/datetime'

import { TransactionDialog } from './TransactionDialog'
import { cn } from '@/utils/cn'
import { formatTransfersByDate } from '@/utils/transfer'

const TransactionHistory = ({ transfers }: { transfers: CompletedTransfer[] }) => {
  const formattedTransfers = formatTransfersByDate(transfers)

  return (
    <div className="z-20 mb-12 flex max-h-[70vh] max-w-[90vw] flex-col gap-4 overflow-auto rounded-3xl border-1 border-turtle-foreground bg-white px-[1.5rem] py-[2rem] sm:w-[31.5rem] sm:p-[2.5rem]">
      {formattedTransfers.map(({ date, transfers }, idx) => (
        <div key={idx + date + transfers.length}>
          <div className="w-full space-y-3">
            <p className={cn('tx-group-date mb-[-1] text-sm', idx !== 0 && 'mt-5')}>
              {formatCompletedTransferDate(date)}
            </p>
            {transfers.reverse().map((tx, idx) => (
              <TransactionDialog key={idx + tx.id + tx.sender} tx={tx} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default TransactionHistory
