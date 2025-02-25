export interface TokenPrice {
  usd: number
}

export type TokenPriceResult = {
  price?: number
  loading: boolean
}

export interface Erc20Balance {
  value: bigint
  decimals: number
  symbol: string
  formatted: string
}
