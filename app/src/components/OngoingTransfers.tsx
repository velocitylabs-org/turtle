'use client'

import useOngoingTransfersTracker from '@/hooks/useOngoingTransfersTracker'
import { DisplaysTransfers } from '@/models/transfer'
import { useOngoingTransfersStore } from '@/store/ongoingTransfersStore'
import { colors } from '../../tailwind.config'
import OngoingTransferDialog from './OngoingTransferDialog'
import { ArrowRight } from './svg/ArrowRight'
import useOcelloidsSubscribe from '@/hooks/useOcelloidsSubscribe'
import useOngoingTransfersCleaner from '@/hooks/useOngoingTransferCleaner'

const OngoingTransfers = ({
  newTransferInit,
  setNewTransferInit,
  hasCompletedTransfers,
}: DisplaysTransfers) => {
  const ongoingTransfers = useOngoingTransfersStore(state => state.transfers).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
  const { statusMessages } = useOngoingTransfersTracker()
  useOngoingTransfersCleaner(ongoingTransfers)
  useOcelloidsSubscribe(ongoingTransfers)

  return (
    <div id="ongoing-txs">
      {ongoingTransfers && ongoingTransfers.length > 0 && (
        <div className="my-20">
          <div className="xl-letter-spacing self-center text-center text-3xl text-turtle-foreground">
            Ongoing
          </div>
          <div className="mt-8 flex w-full flex-col gap-2 rounded-[24px] border-1 border-turtle-foreground bg-white p-[2.5rem] px-[1.5rem] py-[2rem] sm:p-[2.5rem]">
            {ongoingTransfers.map(tx => (
              <OngoingTransferDialog key={tx.id} transfer={tx} status={statusMessages[tx.id]} />
            ))}

            {hasCompletedTransfers && (
              <button
                onClick={() => newTransferInit === 'New' && setNewTransferInit('Done')}
                disabled={!hasCompletedTransfers}
                className="flex w-full flex-row items-center justify-center rounded-[8px] border border-turtle-level3 py-[8px] text-center text-lg text-turtle-foreground"
              >
                <span>View completed transactions</span>{' '}
                <ArrowRight
                  className="mx-2 h-[1.3rem] w-[1.3rem]"
                  fill={colors['turtle-foreground']}
                />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default OngoingTransfers
