export interface Chain {
  /** Unique identifier for the chain, a human-readable string like 'ethereum' or 'assethub'. */
  uid: string
  /** Full name of the chain. */
  name: string
  /** image URL of the chain logo. */
  logoURI: string
  /**
   * The actual chain ID number relative to the network. For example,
   * AssetHub chain ID is 1000, Ethereum is 1, and Centrifuge is 2031 on Polkadot.
   * Different networks may have chains with the same chain ID.
   */
  chainId: number
  /** Network the chain belongs to, e.g., Polkadot, Ethereum. */
  network: Network
  /** Address type for the chain. This is needed because, for example, Mythical belongs to the Polkadot network but uses 20byte eth addresses  */
  addressType?: AddressType
}

export enum Network {
  Ethereum = 'Ethereum',
  Polkadot = 'Polkadot',
}

export enum AddressType {
  EVM = 'EVM', // 20 byte
  SS58 = 'SS58', // 32 byte
}
