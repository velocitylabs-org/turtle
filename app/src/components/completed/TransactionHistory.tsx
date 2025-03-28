import { CompletedTransfer } from '@/models/transfer'
import { formatCompletedTransferDate } from '@/utils/datetime'
import { cn } from '@/utils/cn'
import { formatTransfersByDate } from '@/utils/transfer'
import TransactionCard from '@/components/completed/TransactionCard'
import { useCallback, useState } from 'react'
import TransactionCardDetail from './TransactionCardDetail'
import DynamicTray from '@/components/DynamicTray'
import { useMemo } from 'react'
import { twMerge } from 'tailwind-merge'

interface TransactionHistoryProps {
  transfers: CompletedTransfer[]
}

export default function TransactionHistory({ transfers }: TransactionHistoryProps) {
  const [selectedTxForDetail, setSelectedTxForDetail] = useState<CompletedTransfer | null>(null)
  const formattedTransfers = formatTransfersByDate(transfers)

  const selectTx = useCallback((tx: CompletedTransfer) => setSelectedTxForDetail(tx), [])
  const unSelectTx = useCallback(() => setSelectedTxForDetail(null), [])

  const TransactionCardComp = useMemo(
    () =>
      formattedTransfers.map(({ date, transfers }, idx) => (
        <div key={idx + date + transfers.length}>
          <div className="w-full space-y-3">
            <p className={cn('tx-group-date mb-[-1] text-sm', idx !== 0 && 'mt-5')}>
              {formatCompletedTransferDate(date)}
            </p>
            {transfers.reverse().map((tx, idx) => (
              <TransactionCard
                key={idx + tx.id + tx.sender}
                selectTx={selectTx}
                tx={tx}
              />
            ))}
          </div>
        </div>
      )),
    [formattedTransfers, selectTx],
  )

  const TransactionHistoryCardDetailComp = useMemo(
    () => (
      <TransactionCardDetail
        tx={selectedTxForDetail}
        unSelectTx={unSelectTx}
      />
    ),
    [selectedTxForDetail, unSelectTx],
  )

  // These two (maxHeightClass and maxHeightNumber) should mach, in this case 72
  const maxHeightClass = 'max-h-[72vh]'
  const maxHeightNumber = window.innerHeight * 0.72
  const classNames = useMemo(
    () =>
      twMerge(
        maxHeightClass,
        'z-20 flex max-w-[90vw] flex-col gap-4 overflow-auto rounded-3xl border-1 border-turtle-foreground bg-white px-[1.5rem] py-[2rem] sm:w-[31.5rem] sm:p-[2.5rem]',
      ),
    [maxHeightClass],
  )

  return (
    <DynamicTray
      containerClassnames={classNames}
      baseEl={TransactionCardComp}
      swapEl={TransactionHistoryCardDetailComp}
      swapCondition={!!selectedTxForDetail}
      maxHeight={maxHeightNumber}
      duration={0.07}
    />
  )
}
