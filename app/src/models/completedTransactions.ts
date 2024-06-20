export enum Status {
  Pending = 'pending',
  Completed = 'completed',
  Failed = 'failed',
}

export type TransactionStatus = Status.Pending | Status.Completed | Status.Failed

export type Transaction = {
  status: TransactionStatus
  transactionHashes?: string[]
  errors?: string[]
  fromChain: string
  fromChainToken: string
  fromChainAmount: number
  fromChainAmountValue: number
  toChain: string
  toChainToken: string
  toChainAmount: number
  toChainAmountValue: number
  fees: number
  feesValue: number
  minTokenRecieved: number
  minTokenRecievedValue: number
  fromAddress: string
  toAddress: string
  timestamp: string
}
export type TransactionsByDate = Record<string, Transaction[]>
