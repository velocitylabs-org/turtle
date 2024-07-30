'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'

import Menu from '@/components/Menu'
import Transfer from '@/components/Transfer'
import useCompletedTransfers from '@/hooks/useCompletedTransfers'
import { TransferTabOptions, TransferTab } from '@/models/transfer'

import OngoingTransfers from './OngoingTransfers'
import TransactionLoaderSkeleton from './completed/TransactionLoaderSkeleton'

const TransferHistory = dynamic(() => import('@/components/completed/TransactionHistory'), {
  loading: () => <TransactionLoaderSkeleton />,
})

export const HomeComponentSelect = () => {
  const { completedTransfers } = useCompletedTransfers()
  const [newTransferInit, setNewTransferInit] = useState<TransferTabOptions>(TransferTab.New)
  const hasCompletedTransfers = !!completedTransfers && completedTransfers.length > 0

  return (
    <>
      <Menu
        newTransferInit={newTransferInit}
        setNewTransferInit={setNewTransferInit}
        hasCompletedTransfers={hasCompletedTransfers}
      />
      {newTransferInit === TransferTab.New ? (
        <div className="z-15 relative max-w-[90vw]">
          <Transfer />
          <OngoingTransfers
            newTransferInit={newTransferInit}
            setNewTransferInit={setNewTransferInit}
            hasCompletedTransfers={hasCompletedTransfers}
          />
        </div>
      ) : (
        hasCompletedTransfers &&
        completedTransfers && <TransferHistory transactions={completedTransfers} />
      )}
    </>
  )
}
