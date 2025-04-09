import { toEthereum, toPolkadot } from '@snowbridge/api'
import { Direction } from '@/services/transfer'
import { Environment } from '@/store/environmentStore'

import { Chain } from './chain'
import { FromEthTrackingResult, FromAhToEthTrackingResult } from './snowbridge'
import { FromParachainTrackingResult } from './subscan'
import { Token } from './token'

export interface RawTransfer {
  /** Substrate extrinsic hash or Ethereum transaction hash */
  id: string
  sourceChain: Chain
  destChain: Chain
  sender: string
  recipient: string
  token: Token
  date: Date
  crossChainMessageHash?: string
  parachainMessageId?: string
  sourceChainExtrinsicIndex?: string
}
export interface StoredTransfer extends RawTransfer {
  // Params
  tokenUSDValue?: number
  amount: string
  fees: AmountInfo
  bridgingFee: AmountInfo | null
  // Contextual
  environment: Environment // to access context
  // TODO(nuno): we can have multiple types of transfer and have this depend on that type.
  // that way we can support different fields, for example for xcm-only transfers in the future.
  sendResult?: toEthereum.SendResult | toPolkadot.SendResult
  // A subscan unique Id shared accross chains to track ongoing transfers
  uniqueTrackingId?: string
  status?: string
  // WithinPolkadot transfer is considered as finalized
  finalizedAt?: Date
}

export interface OngoingTransferWithDirection extends RawTransfer {
  direction: Direction
}

export interface OngoingTransfers {
  toEthereum: OngoingTransferWithDirection[] // AH => Eth transfer
  toPolkadot: OngoingTransferWithDirection[] // Eth => AH || Parachain transfer
  withinPolkadot: OngoingTransferWithDirection[] // XCM transfer: Parachain to AH, AH to Parachain, Parachain to Parachain, etc
}

export enum TxStatus {
  Succeeded = 'Succeeded',
  Failed = 'failed',
  Undefined = 'Undefined',
}

export type TransferResult = TxStatus.Succeeded | TxStatus.Failed | TxStatus.Undefined

export type CompletedTransfer = {
  id: string
  result: TransferResult
  token: Token
  tokenUSDValue?: number
  sourceChain: Chain
  destChain: Chain
  amount: string
  fees: AmountInfo
  bridgingFee: AmountInfo | null
  minTokenRecieved?: string
  minTokenRecievedValue?: number
  sender: string
  recipient: string
  date: Date
  explorerLink?: string
  errors?: string[]
}
export type TransfersByDate = Record<string, CompletedTransfer[]>

export interface AmountInfo {
  /* The amount in the `token` currency */
  amount: string | bigint | number
  /* the token  */
  token: Token
  /* the amount converted to USD dollars */
  inDollars: number
}

export type TabOptions = 'New' | 'Done'

export type TxTrackingResult =
  // Snowbridge API | Snowbridge API | Subscan API
  FromEthTrackingResult | FromAhToEthTrackingResult | FromParachainTrackingResult
