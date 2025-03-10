import useOcelloidsSubscribe from '@/hooks/useOcelloidsSubscribe'
import OngoingTransferDialog from './OngoingTransferDialog'
import { StoredTransfer } from '@/models/transfer'

const OngoingTransfers = ({ ongoingTransfers }: { ongoingTransfers: StoredTransfer[] }) => {
  ongoingTransfers.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  // const { statusMessages } = useOngoingTransfersTracker(ongoingTransfers)
  // useOngoingTransfersCleaner(ongoingTransfers)
  useOcelloidsSubscribe(ongoingTransfers)

  return (
    <div
      id="ongoing-txs"
      className="z-20 flex flex-col gap-1 rounded-2xl border bg-white p-5 px-[1.5rem] py-[2rem] sm:w-[31.5rem] sm:p-[2.5rem]"
    >
      {ongoingTransfers && ongoingTransfers.length > 0 && (
        <div>
          {ongoingTransfers.map(tx => (
            <OngoingTransferDialog key={tx.id} transfer={tx} /> //status={statusMessages[tx.id]}
          ))}
        </div>
      )}
    </div>
  )
}

export default OngoingTransfers
