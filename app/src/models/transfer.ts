import { Dispatch, SetStateAction } from 'react'
import * as Snowbridge from '@snowbridge/api'

import { Environment } from '@/store/environmentStore'

import { Chain } from './chain'
import { Token } from './token'
export interface StoredTransfer {
  // Params
  id: string
  sourceChain: Chain
  token: Token
  sender: string
  destChain: Chain
  amount: string
  recipient: string
  date: Date
  feeAmount: string
  feeToken: Token

  // Contextual
  environment: Environment // to access context
  // TODO(nuno): we can have multiple types of transfer and have this depend on that type.
  // that way we can support different fields, for example for xcm-only transfers in the future.
  sendResult: Snowbridge.toEthereum.SendResult | Snowbridge.toPolkadot.SendResult
}

export interface DisplaysTransfers {
  isNewTransaction: boolean
  setIsNewTransaction: Dispatch<SetStateAction<boolean>>
  isCompletedTransactions: boolean
}

export enum TxStatus {
  Pending = 'pending',
  Completed = 'completed',
  Failed = 'failed',
}

export type TransferStatus = TxStatus.Pending | TxStatus.Completed | TxStatus.Failed

export type CompletedTransfer = {
  id: string
  status: TransferStatus
  transactionHashes?: string[]
  errors?: string[]
  token: Token
  sourceChain: Chain
  destChain: Chain
  amount: string
  amountValue?: number
  feeToken: Token
  feeAmount: string
  feesValue?: number
  minTokenRecieved: string
  minTokenRecievedValue?: number
  sender: string
  recipient: string
  date: string
}
export type TransfersByDate = Record<string, CompletedTransfer[]>
