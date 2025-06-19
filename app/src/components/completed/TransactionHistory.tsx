import { Chain, chainsByUid, Token, tokensById } from '@velocitylabs-org/turtle-registry'
import { cn } from '@velocitylabs-org/turtle-ui'
import { CompletedTransfer } from '@/models/transfer'
import { formatCompletedTransferDate } from '@/utils/datetime'
import { formatTransfersByDate } from '@/utils/transfer'
import TransactionDialog from './TransactionDialog'

interface TransactionHistoryProps {
  transfers: CompletedTransfer[]
}

export default function TransactionHistory({ transfers }: TransactionHistoryProps) {
  const formattedTransfers = formatTransfersByDate(transfers)

  return (
    <div className="z-20 mb-12 flex max-h-[70vh] w-[100vw] max-w-[90vw] flex-col gap-4 overflow-auto rounded-3xl border border-turtle-foreground bg-white px-[1.5rem] py-[2rem] sm:w-[31.5rem] sm:p-[2.5rem]">
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
