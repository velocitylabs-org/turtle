import type { Context, historyV2 as history } from '@snowbridge/api'
import type { AssetRegistry } from '@snowbridge/base-types'

export type FromEthTrackingResult = history.ToPolkadotTransferResult
export type FromParaToEthTrackingResult = history.ToEthereumTransferResult

export type SnowbridgeContext = Context & { registry: AssetRegistry }
