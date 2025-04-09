'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import TabNavigation from '@/components/TabNavigation'
import Transfer from '@/components/Transfer'
import useCompletedTransfers from '@/hooks/useCompletedTransfers'
import { TabOptions } from '@/models/transfer'
import OngoingTransfers from './OngoingTransfers'
import TransactionLoaderSkeleton from './completed/TransactionLoaderSkeleton'
import { cn } from '@/utils/cn'

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
