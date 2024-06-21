import { Transaction, TransactionsByDate } from '@/models/completedTransactions'
import { formatDate } from '@/utils/datetime'

import { TransactionDialog } from './TransactionDialog'

export const TransactionHistory = ({ transactions }: { transactions: Transaction[] }) => {
  const transactionsByDate = transactions.reduce<TransactionsByDate>((acc, transaction) => {
    const date = transaction.timestamp.split('T')[0]
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(transaction)
    return acc
  }, {})

  const mappedTransactionsByDate = Object.keys(transactionsByDate).map(date => {
    return { date, transactions: transactionsByDate[date] }
  })

  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-white p-4 sm:w-[31.5rem] sm:p-[2.5rem]">
      {mappedTransactionsByDate.map(({ date, transactions }, idx) => (
        <div key={idx + date + transactions.length}>
          <div className="w-full space-y-4">
            <p className="text-sm">{formatDate(date)}</p>
            {transactions.map((tx, idx) => (
              <TransactionDialog key={idx + tx.fromAddress} tx={tx} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
