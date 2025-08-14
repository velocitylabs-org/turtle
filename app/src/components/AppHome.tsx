'use client'
import { FormContainer, HistoryLoaderSkeleton, type TransferTabOptions } from '@velocitylabs-org/turtle-ui'
import dynamic from 'next/dynamic'
import { Suspense, useState } from 'react'
import TabNavigation from '@/components/TabNavigation'
import Transfer from '@/components/Transfer'
import useCompletedTransfers from '@/hooks/useCompletedTransfers'
import type { TabOptions } from '@/models/transfer'
import { useOngoingTransfersStore } from '@/store/ongoingTransfersStore'

const TransactionHistory = dynamic(() => import('./TransactionsHistory'), {
  loading: () => <HistoryLoaderSkeleton length={10} />,
  ssr: false,
})

export default function AppHome() {
  const { completedTransfers } = useCompletedTransfers()
  const [selectedTab, setSelectedTab] = useState<TabOptions>('New')
  const hasCompletedTransfers = !!completedTransfers && completedTransfers.length > 0

  const ongoingTransfers = useOngoingTransfersStore(state => state.transfers)
  const [newTransferInit, setNewTransferInit] = useState<TransferTabOptions>('New')
  const isHistoryTabSelected = newTransferInit === 'History'

  return (
    <>
      <TabNavigation
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        hasCompletedTransfers={hasCompletedTransfers}
      />
      <FormContainer
        ongoingTransfers={ongoingTransfers}
        completedTransfers={completedTransfers}
        isHistoryTabSelected={isHistoryTabSelected}
        newTransferInit={newTransferInit}
        setNewTransferInit={setNewTransferInit}
      >
        {!isHistoryTabSelected ? (
          <Transfer />
        ) : (
          <Suspense
            fallback={
              <HistoryLoaderSkeleton
                length={ongoingTransfers.length + (completedTransfers ? completedTransfers.length : 0)}
              />
            }
          >
            <TransactionHistory transfers={completedTransfers} />
          </Suspense>
        )}
      </FormContainer>
    </>
  )
}
