export interface Route {
  from: string
  to: string
  sdk: TransferSDK
  tokens: string[]
}

export type TransferSDK = 'SnowbridgeApi' | 'ParaSpellApi'
