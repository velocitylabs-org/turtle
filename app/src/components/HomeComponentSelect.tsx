'use client'
import { useState } from 'react'

import Menu from '@/components/Menu'
import Transfer from '@/components/Transfer'
import { TransactionHistory } from '@/components/completed/TransactionHistory'
import useCompletedTransfers from '@/hooks/useCompletedTransfers'

import OngoingTransfers from './OngoingTransfers'

export const HomeComponentSelect = () => {
  const { completedTransfers } = useCompletedTransfers()
  const [isNewTransaction, setIsNewTransaction] = useState<boolean>(true)
  const isCompletedTransactions = !!completedTransfers && completedTransfers.length > 0

  return (
    <>
      <Menu
        isNewTransaction={isNewTransaction}
        setIsNewTransaction={setIsNewTransaction}
        isCompletedTransactions={isCompletedTransactions}
      />
      {isNewTransaction ? (
        <div className="z-15 relative max-w-[90vw]">
          <Transfer />
          <OngoingTransfers
            isNewTransaction={isNewTransaction}
            setIsNewTransaction={setIsNewTransaction}
            isCompletedTransactions={isCompletedTransactions}
          />
        </div>
      ) : (
        isCompletedTransactions &&
        completedTransfers && <TransactionHistory transactions={completedTransfers} />
      )}
    </>
  )
}
