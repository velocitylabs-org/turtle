import type { TRouterPlan } from '@paraspell/xcm-router'
import type { toEthereum, toPolkadot } from '@snowbridge/api'
import type { Chain, Token } from '@velocitylabs-org/turtle-registry'
import type { Direction } from '@/services/transfer'
import type { FromAhToEthTrackingResult, FromEthTrackingResult } from './snowbridge'
import type { FromParachainTrackingResult } from './subscan'

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
  fees: FeeDetails[]
  // TODO(nuno): we can have multiple types of transfer and have this depend on that type.
  // that way we can support different fields, for example for xcm-only transfers in the future.
  sendResult?: toEthereum.SendResult | toPolkadot.SendResult
  // A subscan unique Id shared accross chains to track ongoing transfers
  uniqueTrackingId?: string
  status?: string
  // WithinPolkadot transfer is considered as finalized
  finalizedAt?: Date
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
  sendResult?: toEthereum.SendResult | toPolkadot.SendResult
  // A subscan unique Id shared accross chains to track ongoing transfers
  uniqueTrackingId?: string
  status?: string
  // WithinPolkadot transfer is considered as finalized
  finalizedAt?: Date
}

/** Version 1 of a stored transfer. It was used after introducing swaps but before array fees. */
export interface StoredTransferV1 extends RawTransfer {
  sourceTokenUSDValue?: number
  destinationTokenUSDValue?: number
  sourceAmount: string
  destinationAmount?: string
  fees: AmountInfo
  bridgingFee: AmountInfo | null
  sendResult?: toEthereum.SendResult | toPolkadot.SendResult
  uniqueTrackingId?: string
  status?: string
  finalizedAt?: Date
  swapInformation?: {
    currentStep?: number
    plan?: TRouterPlan
  }
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
  sourceToken: Token
  destinationToken?: Token
  sourceTokenUSDValue?: number
  destinationTokenUSDValue?: number
  sourceAmount: string
  destinationAmount?: string
  sourceChain: Chain
  destChain: Chain
  fees: FeeDetails[]
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

/** Version 1 of a completed transfer. It was used after introducing swaps but before array fees. */
export type CompletedTransferV1 = {
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

export type OnChainBaseEvents = {
  messageHash?: string
  messageId?: string
  extrinsicIndex?: string
  isBatchCompleted?: boolean
  isExtrinsicSuccess?: boolean
  isExecuteAttemptCompleted?: boolean
}

type FeeDetailType = 'Execution fees' | 'Destination fees' | 'Bridging fees' | 'Swap fees'

export type FeeSufficiency = 'sufficient' | 'insufficient' | 'undetermined'

export interface FeeDetails {
  // The title of the fee - e.g. 'Execution fees'
  title: FeeDetailType
  // The chain in which the fee is charged
  chain: Chain
  // The amount to be charged
  amount: AmountInfo
  // Indicates if the user's balance is enough to cover this transfer fee
  // 'undetermined' when a chain lacks dry-run support to validate sufficiency
  sufficient: FeeSufficiency
}
