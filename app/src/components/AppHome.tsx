'use client'
import { cn } from '@velocitylabs-org/turtle-ui'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import TabNavigation from '@/components/TabNavigation'
import Transfer from '@/components/Transfer'
import useCompletedTransfers from '@/hooks/useCompletedTransfers'
import type { TabOptions } from '@/models/transfer'
import TransactionLoaderSkeleton from './completed/TransactionLoaderSkeleton'
import OngoingTransfers from './ongoing/OngoingTransfers'

const TransferHistory = dynamic(() => import('@/components/completed/TransactionHistory'), {
  loading: () => <TransactionLoaderSkeleton />,
  ssr: false,
})

export default function AppHome() {
  const { completedTransfers } = useCompletedTransfers()
  const [selectedTab, setSelectedTab] = useState<TabOptions>('New')
  const hasCompletedTransfers = !!completedTransfers && completedTransfers.length > 0
  const isDoneTabSelected = selectedTab === 'Done'

  return (
    <>
      <TabNavigation
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        hasCompletedTransfers={hasCompletedTransfers}
      />
      <div className={cn('z-15 relative max-w-[90vw]', isDoneTabSelected && 'hidden')}>
        <Transfer />
        <OngoingTransfers
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          hasCompletedTransfers={hasCompletedTransfers}
        />
      </div>
      {isDoneTabSelected && <TransferHistory transfers={completedTransfers!} />}
    </>
  )
}
