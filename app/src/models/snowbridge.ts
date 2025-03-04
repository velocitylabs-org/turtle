import { historyV2 as history } from '@snowbridge/api'

export type SnowbridgeStatus = {
  toEthereum: number
  toPolkadot: number
}

export type FromEthTrackingResult = history.ToPolkadotTransferResult
export type FromAhToEthTrackingResult = history.ToEthereumTransferResult
