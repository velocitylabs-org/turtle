import { history } from "@snowbridge/api"

export type SnowbridgeStatus = {
  ethBridgeStatus: number
  polkadotBridgeStatus: number
}

export type FromEthTrackingRes = history.ToPolkadotTransferResult