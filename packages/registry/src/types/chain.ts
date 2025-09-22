export interface Chain {
  /** Unique identifier for the chain, a human-readable string like 'ethereum' or 'assethub'. */
  uid: string
  /** Full name of the chain. */
  name: string
  /** image URL of the chain logo. */
  logoURI: string | Record<string, string>
  /**
   * The actual chain ID number relative to the network. For example,
   * AssetHub chain ID is 1000, Ethereum is 1, and Centrifuge is 2031 on Polkadot.
   * Different networks may have chains with the same chain ID.
   */
  chainId: number
  /** Network the chain belongs to, e.g., Polkadot, Ethereum. */
  network: Network
  /** Address types for the chain. Multiple are supported.  */
  supportedAddressTypes: AddressType[]
  /** Used to determine the correct wallet. */
  walletType: WalletType
  /** Optional parameter for parachains only. Used for xcm transfers. */
  destinationFeeDOT?: string
  /** Optional parameter for parachains only. Used for AT API transfers. */
  rpcConnection?: string
  /** Optional parameter for Polkadot chains only to signal if they support 'execute' function. Used to signal that this chain allows to Send Swap Send with 1 signature */
  supportExecuteExtrinsic?: boolean
}

export type Network = 'Ethereum' | 'Polkadot' | 'Kusama' | 'Arbitrum'
export type AddressType = 'evm' | 'ss58'
export type WalletType = 'EVM' | 'Substrate' | 'SubstrateEVM'
