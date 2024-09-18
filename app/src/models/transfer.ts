import { toEthereum, toPolkadot } from '@snowbridge/api'
import { Dispatch, SetStateAction } from 'react'

import { Environment } from '@/store/environmentStore'

import { Chain } from './chain'
import { Token } from './token'
import { Direction } from '@/services/transfer'

export interface RawTransfer {
  id: string // It must be a Substrate extrinsic hash or an Ethereum transaction hash
  sourceChain: Chain
  destChain: Chain
  sender: string
  recipient: string
  token: Token
  date: Date
  crossChainMessageHash?: string
  parachainMessageId?: string
}
export interface StoredTransfer extends RawTransfer {
  // Params
  tokenUSDValue?: number
  amount: string
  fees: Fees
  // Contextual
  environment: Environment // to access context
  // TODO(nuno): we can have multiple types of transfer and have this depend on that type.
  // that way we can support different fields, for example for xcm-only transfers in the future.
  sendResult?: toEthereum.SendResult | toPolkadot.SendResult
}

export interface OngoingTransferWithDirection extends RawTransfer {
  direction: Direction
}

export interface OngoingTransfers {
  toPolkadot: OngoingTransferWithDirection[]
  toEthereum: {
    fromAssetHub: OngoingTransferWithDirection[]
    fromParachain: OngoingTransferWithDirection[]
  }
}

export interface DisplaysTransfers {
  newTransferInit: TransferTab
  setNewTransferInit: Dispatch<SetStateAction<TransferTab>>
  hasCompletedTransfers: boolean
}

export enum TxStatus {
  Succeeded = 'Succeeded',
  Failed = 'failed',
}

export type TransferResult = TxStatus.Succeeded | TxStatus.Failed

export type CompletedTransfer = {
  id: string
  result: TransferResult
  token: Token
  tokenUSDValue?: number
  sourceChain: Chain
  destChain: Chain
  amount: string
  fees: Fees
  minTokenRecieved?: string
  minTokenRecievedValue?: number
  sender: string
  recipient: string
  date: Date
  explorerLink?: string
  errors?: string[]
}
export type TransfersByDate = Record<string, CompletedTransfer[]>
export interface Fees {
  /* The amount in the `token` currency */
  amount: string
  /* the token of the fees */
  token: Token
  /* the value in dollars */
  inDollars: number
}

export enum TransferTab {
  New = 'New',
  Completed = 'Completed',
}
export type TransferTabOptions = TransferTab
