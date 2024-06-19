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
export type TransactionsByDate = Record<string, Transaction[]>
