'use client'
import {
  AppBody,
  HistoryLoaderSkeleton,
  TabSwitcherWrapper,
  type TransferTabOptions,
} from '@velocitylabs-org/turtle-ui'
import dynamic from 'next/dynamic'
import { Suspense, useState } from 'react'
import Transfer from '@/components/Transfer'
import useCompletedTransfers from '@/hooks/useCompletedTransfers'
import { useOngoingTransfersStore } from '@/store/ongoingTransfersStore'
import OnOffRamp from './OnOffRamp'

const TransactionHistory = dynamic(() => import('./TransactionsHistory'), {
  loading: () => <HistoryLoaderSkeleton length={5} />,
  ssr: false,
})

export default function AppHome() {
  const { completedTransfers } = useCompletedTransfers()

  const ongoingTransfers = useOngoingTransfersStore(state => state.transfers)
  const [selectedTab, setSelectedTab] = useState<TransferTabOptions>('New')
  const isHistoryTabSelected = selectedTab === 'History'

  return (
    <TabSwitcherWrapper
      TransferComponent={
        <AppBody
          ongoingTransfers={ongoingTransfers}
          completedTransfers={completedTransfers}
          isHistoryTabSelected={isHistoryTabSelected}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
        >
          {!isHistoryTabSelected ? (
            <Transfer />
          ) : (
            <Suspense fallback={<HistoryLoaderSkeleton length={5} />}>
              <TransactionHistory transfers={completedTransfers} />
            </Suspense>
          )}
        </AppBody>
      }
      BuySellComponent={<OnOffRamp />}
    />
  )
}
