'use client'

import { useState } from 'react'

import Menu from '@/components/Menu'
import Transfer from '@/components/Transfer'
import { TransactionHistory } from '@/components/completed/TransactionHistory'
import { transactionsMockUp } from '@/utils/transactionMockUp'

export const HomeComponentSelect = () => {
  const [isNewTransaction, setIsNewTransaction] = useState<boolean>(true)

  return (
    <>
      <Menu isNewTransaction={isNewTransaction} setIsNewTransaction={setIsNewTransaction} />
      {isNewTransaction ? <Transfer /> : <TransactionHistory transactions={transactionsMockUp} />}
    </>
  )
}