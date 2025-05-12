import { TRouterPlan } from '@paraspell/xcm-router'
import { Environment } from '@/stores/environmentStore'
import { Direction } from '@/utils/transfer'
import { Chain } from './chain'
import { FromEthTrackingResult, FromParaToEthTrackingResult } from './snowbridge'
import { Token } from './token'

export interface RawTransfer {
  /** Substrate extrinsic hash or Ethereum transaction hash */
  id: string
  sourceChain: Chain
  destChain: Chain
  sender: string
  recipient: string
  sourceToken: Token
  destinationToken?: Token
  date: Date
  crossChainMessageHash?: string
  parachainMessageId?: string
  sourceChainExtrinsicIndex?: string
}
export interface StoredTransfer extends RawTransfer {
  // Params
  sourceTokenUSDValue?: number
  destinationTokenUSDValue?: number
  sourceAmount: string
  destinationAmount?: string
  fees: AmountInfo
  bridgingFee: AmountInfo | null
  // Contextual
  environment: Environment // to access context
  // TODO(nuno): we can have multiple types of transfer and have this depend on that type.
  // that way we can support different fields, for example for xcm-only transfers in the future.
  sendResult?: string //toEthereum.SendResult | toPolkadot.SendResult
  // A subscan unique Id shared accross chains to track ongoing transfers
  uniqueTrackingId?: string
  status?: string
  // WithinPolkadot transfer is considered as finalized
  finalizedAt?: Date
  progress?: number
  swapInformation?: {
    currentStep?: number
    plan?: TRouterPlan
  }
}

/** Version 0 of a stored transfer. It was used before introducing swaps. */
export interface StoredTransferV0 extends RawTransferV0 {
  tokenUSDValue?: number
  amount: string
  fees: AmountInfo
  bridgingFee: AmountInfo | null
  environment: Environment // to access context
  sendResult?: string //toEthereum.SendResult | toPolkadot.SendResult
  // A subscan unique Id shared accross chains to track ongoing transfers
  uniqueTrackingId?: string
  status?: string
  // WithinPolkadot transfer is considered as finalized
  finalizedAt?: Date
}

export interface RawTransferV0 {
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

export interface OngoingTransferWithDirection extends RawTransfer {
  direction: Direction
}

export interface OngoingTransfers {
  toEthereum: OngoingTransferWithDirection[] // Parachain => Eth transfer
  toPolkadot: OngoingTransferWithDirection[] // Eth => Parachain transfer
}

export interface AmountInfo {
  /* The amount in the `token` currency */
  amount: string | bigint | number
  /* the token  */
  token: Token
  /* the amount converted to USD dollars */
  inDollars: number
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
  sourceToken: Token
  destinationToken?: Token
  sourceTokenUSDValue?: number
  destinationTokenUSDValue?: number
  sourceAmount: string
  destinationAmount?: string
  sourceChain: Chain
  destChain: Chain
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

/** Version 0 of a completed transfer. It was used before introducing swaps. */
export type CompletedTransferV0 = {
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

export type TxTrackingResult =
  // Snowbridge API | Snowbridge API | Subscan API
  FromEthTrackingResult | FromParaToEthTrackingResult //| FromParachainTrackingResult

type onChainBaseEvents = {
  messageHash?: string
  messageId?: string
  extrinsicIndex?: string
}

export type PapiEvents = onChainBaseEvents

export type PjsEvents = onChainBaseEvents & {
  isBatchCompleted?: boolean
}
