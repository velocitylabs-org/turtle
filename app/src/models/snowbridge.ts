import type { Context, historyV2 as history } from '@snowbridge/api'
import type { AssetRegistry } from '@snowbridge/base-types'

export type SnowbridgeStatus = {
  toEthereum: number
  toPolkadot: number
}

export type SnowbridgeContext = Context & { registry: AssetRegistry }

export type FromEthTrackingResult = history.ToPolkadotTransferResult
export type FromAhToEthTrackingResult = history.ToEthereumTransferResult
