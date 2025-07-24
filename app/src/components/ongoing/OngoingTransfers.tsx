'use client'
import { type Chain, chainsByUid, type Token, tokensById } from '@velocitylabs-org/turtle-registry'
import type { Dispatch, SetStateAction } from 'react'
import useOcelloidsSubscribe from '@/hooks/useOcelloidsSubscribe'
import useOngoingTransfersCleaner from '@/hooks/useOngoingTransferCleaner'
import useOngoingTransfersTracker from '@/hooks/useOngoingTransfersTracker'
import type { TabOptions } from '@/models/transfer'
import { useOngoingTransfersStore } from '@/store/ongoingTransfersStore'
import { colors } from '../../../tailwind.config'
import ArrowRight from '../svg/ArrowRight'
import OngoingTransferDialog from './OngoingTransferDialog'

interface OngoingTransfersProps {
  selectedTab: TabOptions
  setSelectedTab: Dispatch<SetStateAction<TabOptions>>
  hasCompletedTransfers: boolean
}

export default function OngoingTransfers({
  selectedTab,
  setSelectedTab,
  hasCompletedTransfers,
}: OngoingTransfersProps) {
  const ongoingTransfers = useOngoingTransfersStore((state) => state.transfers).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
  const { statusMessages } = useOngoingTransfersTracker(ongoingTransfers)

  useOngoingTransfersCleaner(ongoingTransfers)
  useOcelloidsSubscribe(ongoingTransfers)

  return (
    <div id="ongoing-txs">
      {ongoingTransfers && ongoingTransfers.length > 0 && (
        <div className="my-20">
          <div className="xl-letter-spacing self-center text-center text-3xl text-turtle-foreground">Ongoing</div>
          <div className="mt-8 flex w-full flex-col gap-2 rounded-[24px] border border-turtle-foreground bg-white p-[2.5rem] px-[1.5rem] py-[2rem] sm:p-[2.5rem]">
            {ongoingTransfers.map((tx) => {
              const transfer = {
                ...tx,
                sourceToken: tokensById[tx.sourceToken.id] as Token,
                destinationToken: tokensById[tx.destinationToken?.id as string] as Token,
                sourceChain: chainsByUid[tx.sourceChain.uid] as Chain,
                destChain: chainsByUid[tx.destChain.uid] as Chain,
              }

              return <OngoingTransferDialog key={tx.id} transfer={transfer} status={statusMessages[tx.id]} />
            })}

            {hasCompletedTransfers && (
              <button
                onClick={() => selectedTab === 'New' && setSelectedTab('Done')}
                disabled={!hasCompletedTransfers}
                className="flex w-full flex-row items-center justify-center rounded-[8px] border border-turtle-level3 py-[8px] text-center text-lg text-turtle-foreground"
              >
                <span>View completed transactions </span>
                <ArrowRight className="mx-2 h-[1.3rem] w-[1.3rem]" fill={colors['turtle-foreground']} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
