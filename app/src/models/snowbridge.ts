import { history } from '@snowbridge/api'

export type SnowbridgeStatus = {
  ethBridgeStatus: number
  polkadotBridgeStatus: number
}

export type FromEthTrackingResult = history.ToPolkadotTransferResult
export type FromAhToEthTrackingResult = history.ToEthereumTransferResult
