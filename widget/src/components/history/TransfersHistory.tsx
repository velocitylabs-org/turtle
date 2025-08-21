import useOcelloidsSubscribe from '@/hooks/useOcelloidsSubscribe'
import useOngoingTransferCleaner from '@/hooks/useOngoingTransferCleaner'
import useOngoingTransfersTracker from '@/hooks/useOngoingTransfersTracker'
import type { CompletedTransfer, StoredTransfer } from '@/models/transfer'
import { CompletedTransferDialog } from './completed-transfers/Dialog'
import { OngoingTransferDialog } from './ongoing-transfers/Dialog'

const TransfersHistory = ({
  ongoingTransfers,
  completedTransfers,
}: {
  ongoingTransfers: StoredTransfer[]
  completedTransfers: CompletedTransfer[]
}) => {
  ongoingTransfers.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  completedTransfers.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const { statusMessages } = useOngoingTransfersTracker(ongoingTransfers)
  useOngoingTransferCleaner(ongoingTransfers)
  useOcelloidsSubscribe(ongoingTransfers)

  return (
    <div
      id="ongoing-txs"
      className="z-20 flex h-[90vh] sm:h-[525px] max-w-[90vw] flex-col gap-1 overflow-auto rounded-b-3xl border border-t-0 border-turtle-foreground bg-turtle-background p-5 px-[1.5rem] py-[2rem] sm:w-[31.5rem] sm:p-[2.5rem]"
    >
      {!ongoingTransfers.length && !completedTransfers.length ? (
        <div className="text-center text-sm text-turtle-level5">No transfers yet</div>
      ) : (
        <>
          {ongoingTransfers.length > 0 && (
            <div>
              {ongoingTransfers.map(tx => (
                <OngoingTransferDialog key={tx.id} transfer={tx} status={statusMessages[tx.id]} />
              ))}
            </div>
          )}

          {completedTransfers.length > 0 && (
            <div>
              {completedTransfers.map(tx => (
                <CompletedTransferDialog key={tx.id} tx={tx} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default TransfersHistory
