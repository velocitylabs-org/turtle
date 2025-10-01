'use client'
import { type Chain, chainsByUid, type Token, tokensById } from '@velocitylabs-org/turtle-registry'
import { cn } from '@velocitylabs-org/turtle-ui'
import { useChainflipTracker } from '@/hooks/useChainflipTracker'
import useOcelloidsSubscribe from '@/hooks/useOcelloidsSubscribe'
import useOngoingTransfersCleaner from '@/hooks/useOngoingTransferCleaner'
import useOngoingTransfersTracker from '@/hooks/useOngoingTransfersTracker'
import type { CompletedTransfer } from '@/models/transfer'
import { useOngoingTransfersStore } from '@/store/ongoingTransfersStore'
import { formatCompletedTransferDate } from '@/utils/datetime'
import { formatTransfersByDate } from '@/utils/transfer'
import CompletedTransferDialog from './completed-transfers/Dialog'
import OngoingTransferDialog from './ongoing-transfers/Dialog'

type TransfersHistoryProps = {
  transfers?: CompletedTransfer[]
}

export default function TransfersHistory({ transfers }: TransfersHistoryProps) {
  const ongoingTxs = useOngoingTransfersStore(state => state.transfers).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
  const completedTxs = formatTransfersByDate(transfers ?? [])
  const { statusMessages } = useOngoingTransfersTracker(ongoingTxs)

  useOngoingTransfersCleaner(ongoingTxs)
  useOcelloidsSubscribe(ongoingTxs)
  useChainflipTracker(ongoingTxs)

  return (
    <div
      id="ongoing-txs"
      className="flex flex-col h-[525px] max-w-[90vw] gap-1 overflow-y-auto rounded-b-3xl border border-t-0 border-turtle-foreground bg-turtle-background p-5 px-[1.5rem] py-[2rem] sm:w-[31.5rem] sm:p-[2.5rem] [&::-webkit-scrollbar]:w-2
  scrollbar scrollbar-thumb-rounded
  [&::-webkit-scrollbar-track]:m-10
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-track]:bg-turtle-level1
  [&::-webkit-scrollbar-thumb]:bg-turtle-level3"
    >
      {ongoingTxs &&
        ongoingTxs.length > 0 &&
        ongoingTxs.map(tx => {
          const transfer = {
            ...tx,
            sourceToken: tokensById[tx.sourceToken.id] as Token,
            destinationToken: tokensById[tx.destinationToken?.id as string] as Token,
            sourceChain: chainsByUid[tx.sourceChain.uid] as Chain,
            destChain: chainsByUid[tx.destChain.uid] as Chain,
          }

          return <OngoingTransferDialog key={tx.id} transfer={transfer} status={statusMessages[tx.id]} />
        })}
      {completedTxs.map(({ date, transfers }, idx) => (
        <div key={idx + date + transfers.length}>
          <div className="w-full space-y-[1rem]">
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

              return <CompletedTransferDialog key={idx + tx.id + tx.sender} tx={transfer} />
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
