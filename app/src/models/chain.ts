import { environment } from '@snowbridge/api'
// TODO: Define the actual Chain interface
export interface Chain {
  id: string
  name: string
  logoURI: string
  chainId: number
  network: Network
}

export enum Network {
  Ethereum = 'Ethereum',
  Polkadot = 'Polkadot',
}
