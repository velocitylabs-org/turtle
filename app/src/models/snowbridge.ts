import { historyV2 as history, assetsV2, Context } from '@snowbridge/api'

export type SnowbridgeStatus = {
  toEthereum: number
  toPolkadot: number
}

export type SnowbridgeContext = Context & { registry: assetsV2.AssetRegistry }

export type FromEthTrackingResult = history.ToPolkadotTransferResult
export type FromAhToEthTrackingResult = history.ToEthereumTransferResult
