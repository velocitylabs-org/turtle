'use client'
import { type Chain, chainsByUid, type Token, tokensById } from '@velocitylabs-org/turtle-registry'
import { cn } from '@velocitylabs-org/turtle-ui'
import TransactionDialog from '@/components/completed/TransactionDialog'
import useOcelloidsSubscribe from '@/hooks/useOcelloidsSubscribe'
import useOngoingTransfersCleaner from '@/hooks/useOngoingTransferCleaner'
import useOngoingTransfersTracker from '@/hooks/useOngoingTransfersTracker'
import type { CompletedTransfer } from '@/models/transfer'
import { useOngoingTransfersStore } from '@/store/ongoingTransfersStore'
import { formatCompletedTransferDate } from '@/utils/datetime'
import { formatTransfersByDate } from '@/utils/transfer'
import OngoingTransferDialog from './ongoing/OngoingTransferDialog'

type TransactionHistoryProps = {
  transfers?: CompletedTransfer[]
}

export default function TransactionHistory({ transfers }: TransactionHistoryProps) {
  const formattedTransfers = formatTransfersByDate(transfers ?? [])
  const ongoingTransfers = useOngoingTransfersStore(state => state.transfers).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
  const { statusMessages } = useOngoingTransfersTracker(ongoingTransfers)

  useOngoingTransfersCleaner(ongoingTransfers)
  useOcelloidsSubscribe(ongoingTransfers)

  return (
    <div
      id="ongoing-txs"
      className="z-20 flex max-h-[70vh] max-w-[90vw] flex-col gap-1 overflow-auto rounded-3xl border border-turtle-foreground bg-turtle-background p-5 px-[1.5rem] py-[2rem] sm:w-[31.5rem] sm:p-[2.5rem]"
    >
      {ongoingTransfers &&
        ongoingTransfers.length > 0 &&
        ongoingTransfers.map(tx => {
          const transfer = {
            ...tx,
            sourceToken: tokensById[tx.sourceToken.id] as Token,
            destinationToken: tokensById[tx.destinationToken?.id as string] as Token,
            sourceChain: chainsByUid[tx.sourceChain.uid] as Chain,
            destChain: chainsByUid[tx.destChain.uid] as Chain,
          }

          return <OngoingTransferDialog key={tx.id} transfer={transfer} status={statusMessages[tx.id]} />
        })}
      {formattedTransfers.map(({ date, transfers }, idx) => (
        <div key={idx + date + transfers.length}>
          <div className="w-full space-y-3">
            <p className={cn('tx-group-date mb-[-1] text-sm', idx !== 0 && 'mt-5')}>
              {formatCompletedTransferDate(date)}
            </p>
            {transfers.reverse().map((tx, idx) => {
              const transfer = {
                ...tx,
                sourceToken: tokensById[tx.sourceToken.id] as Token,
                destinationToken: tokensById[tx.destinationToken?.id as string] as Token,
                sourceChain: chainsByUid[tx.sourceChain.uid] as Chain,
                destChain: chainsByUid[tx.destChain.uid] as Chain,
              }

              return <TransactionDialog key={idx + tx.id + tx.sender} tx={transfer} />
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
