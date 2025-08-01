import { historyV2 as history, Context } from '@snowbridge/api'
import { AssetRegistry } from '@snowbridge/base-types'

export type FromEthTrackingResult = history.ToPolkadotTransferResult
export type FromParaToEthTrackingResult = history.ToEthereumTransferResult

export type SnowbridgeContext = Context & { registry: AssetRegistry }
