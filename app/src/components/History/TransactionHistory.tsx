import { TransactionDialog } from './TransactionDialog'

export enum Status {
  Pending = 'pending',
  Completed = 'completed',
  Failed = 'failed',
}
export type TransactionStatus = 'pending' | 'completed' | 'failed'
export type Transaction = {
  status: TransactionStatus
  amount: number
  token: string
  fromChain: string
  toChain: string
  fromAddress: string
  toAddress: string
  timestamp: string
}
type TransactionsByDate = Record<string, Transaction[]>

export function formatDate(date: string) {
  const dateFrom = new Date(date)
  const weekday = dateFrom.toLocaleDateString('en-US', { weekday: 'long' })
  const month = dateFrom.toLocaleDateString('en-US', { month: 'short' })
  const day = dateFrom.toLocaleDateString('en-US', { day: 'numeric' })
  const year = dateFrom.toLocaleDateString('en-US', { year: 'numeric' })
  return `${weekday} ${month} ${day}, ${year}`
}

export const TransactionHistory = () => {
  const transactions: Transaction[] = [
    {
      status: 'failed',
      amount: 345098.1234573,
      token: 'WETH',
      fromChain: 'Ethereum',
      toChain: 'Polkadot',
      fromAddress: '0x1AFb3aa8d0aD21cE0389bf180499A3DC8dce94bE',
      toAddress: '5HjV1mmZiv43j4nvMjzf27D6vwy7RY9X863qd8RuTVHA7gQ2',
      timestamp: '2024-06-18T08:47:02.016Z',
    },
    {
      status: 'completed',
      amount: 543.657373,
      token: 'WETH',
      fromChain: 'Ethereum',
      toChain: 'Polkadot',
      fromAddress: '0x1AFb3aa8d0aD21cE0389bf180499A3DC8dce94bE',
      toAddress: '5HjV1mmZiv43j4nvMjzf27D6vwy7RY9X863qd8RuTVHA7gQ2',
      timestamp: '2024-06-18T08:20:02.016Z',
    },
    {
      status: 'completed',
      amount: 12.463278,
      token: 'WETH',
      fromChain: 'Ethereum',
      toChain: 'Polkadot',
      fromAddress: '0x1AFb3aa8d0aD21cE0389bf180499A3DC8dce94bE',
      toAddress: '5HjV1mmZiv43j4nvMjzf27D6vwy7RY9X863qd8RuTVHA7gQ2',
      timestamp: '2024-06-13T15:65:02.016Z',
    },
    {
      status: 'failed',
      amount: 10998.09876,
      token: 'WETH',
      fromChain: 'Ethereum',
      toChain: 'Polkadot',
      fromAddress: '0x1AFb3aa8d0aD21cE0389bf180499A3DC8dce94bE',
      toAddress: '5HjV1mmZiv43j4nvMjzf27D6vwy7RY9X863qd8RuTVHA7gQ2',
      timestamp: '2024-06-12T02:12:02.016Z',
    },
    {
      status: 'failed',
      amount: 345098.1234573,
      token: 'WETH',
      fromChain: 'Ethereum',
      toChain: 'Polkadot',
      fromAddress: '0x1AFb3aa8d0aD21cE0389bf180499A3DC8dce94bE',
      toAddress: '5HjV1mmZiv43j4nvMjzf27D6vwy7RY9X863qd8RuTVHA7gQ2',
      timestamp: '2024-05-31T08:47:02.016Z',
    },
    {
      status: 'completed',
      amount: 543.657373,
      token: 'WETH',
      fromChain: 'Ethereum',
      toChain: 'Polkadot',
      fromAddress: '0x1AFb3aa8d0aD21cE0389bf180499A3DC8dce94bE',
      toAddress: '5HjV1mmZiv43j4nvMjzf27D6vwy7RY9X863qd8RuTVHA7gQ2',
      timestamp: '2024-05-18T08:20:02.016Z',
    },
    {
      status: 'completed',
      amount: 12.463278,
      token: 'WETH',
      fromChain: 'Ethereum',
      toChain: 'Polkadot',
      fromAddress: '0x1AFb3aa8d0aD21cE0389bf180499A3DC8dce94bE',
      toAddress: '5HjV1mmZiv43j4nvMjzf27D6vwy7RY9X863qd8RuTVHA7gQ2',
      timestamp: '2024-04-12T15:65:02.016Z',
    },
    {
      status: 'failed',
      amount: 10998.09876,
      token: 'WETH',
      fromChain: 'Ethereum',
      toChain: 'Polkadot',
      fromAddress: '0x1AFb3aa8d0aD21cE0389bf180499A3DC8dce94bE',
      toAddress: '5HjV1mmZiv43j4nvMjzf27D6vwy7RY9X863qd8RuTVHA7gQ2',
      timestamp: '2024-04-12T02:12:02.016Z',
    },
  ]

  const transactionsByDate = transactions.reduce<TransactionsByDate>((acc, transaction) => {
    const date = transaction.timestamp.split('T')[0]
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(transaction)
    return acc
  }, {})

  const mappedTransactionsByDate = Object.keys(transactionsByDate).map(date => {
    const updatedTransactions = transactionsByDate[date].map(transaction => ({
      ...transaction,
    }))
    return { date, transactions: updatedTransactions }
  })

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-black bg-white p-[2.5rem] sm:w-[31.5rem]">
      {mappedTransactionsByDate.map(({ date, transactions }, idx) => (
        <div key={idx + date + transactions.length}>
          <div className="w-full space-y-4">
            <div className="text-sm">{formatDate(date)}</div>
            {transactions.map((tx, idx) => (
              <TransactionDialog key={idx + tx.fromAddress} tx={tx} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
