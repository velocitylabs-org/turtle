// TODO: Define the actual Token interface
export interface Token {
  id: string
  name: string
  logoURI: string
  symbol: string
  decimals: number
  address: Address
}

export interface PolkadotLocation {
  type: 'polkadot'
}
export interface EthereumAddress {
  type: 'ethereum'
  address: string
}
export type AddressType = EthereumAddress | PolkadotLocation

export type Address = Omit<AddressType, 'type'>
