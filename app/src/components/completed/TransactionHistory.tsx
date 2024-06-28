import { CompletedTransfer, TransfersByDate } from '@/models/transfer'
import { formatDate } from '@/utils/datetime'

import { TransactionDialog } from './TransactionDialog'

export const TransactionHistory = ({ transactions }: { transactions: CompletedTransfer[] }) => {
  const transactionsByDate = transactions.reduce<TransfersByDate>((acc, transaction) => {
    const date = transaction.date.toString().split('T')[0]
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
    <div className="z-20 flex flex-col gap-4 rounded-3xl bg-white p-4 sm:w-[31.5rem] sm:p-[2.5rem]">
      {mappedTransactionsByDate.map(({ date, transactions }, idx) => (
        <div key={idx + date + transactions.length}>
          <div className="w-full space-y-4">
            <p className="text-sm">{formatDate(date)}</p>
            {transactions.map((tx, idx) => (
              <TransactionDialog key={idx + tx.id + tx.sender} tx={tx} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
