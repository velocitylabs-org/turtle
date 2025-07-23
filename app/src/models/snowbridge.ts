import { historyV2 as history, Context } from '@snowbridge/api'
import { AssetRegistry } from '@snowbridge/base-types'

export type SnowbridgeStatus = {
  toEthereum: number
  toPolkadot: number
}

export type SnowbridgeContext = Context & { registry: AssetRegistry }

export type FromEthTrackingResult = history.ToPolkadotTransferResult
export type FromAhToEthTrackingResult = history.ToEthereumTransferResult
