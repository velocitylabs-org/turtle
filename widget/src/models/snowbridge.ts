import { historyV2 as history, assetsV2, Context } from '@snowbridge/api'

export type FromEthTrackingResult = history.ToPolkadotTransferResult
export type FromParaToEthTrackingResult = history.ToEthereumTransferResult

export type SnowbridgeContext = Context & { registry: assetsV2.AssetRegistry }
