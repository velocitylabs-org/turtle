import type { TMultiLocation } from '@paraspell/sdk'

export interface Token {
  id: string
  name: string
  logoURI: string | Record<string, string>
  symbol: string
  decimals: number
  address: string
  // The xcm multilocation of an asset serves as a contextual identifier of said asset.
  // Learn more at https://guide.kusama.network/docs/learn/xcm/fundamentals/multilocation-summary
  multilocation: TMultiLocation
  // The coingeko token id, used to fetch the token price. It's not always the token symbol.
  // Examples:
  //   - https://www.coingecko.com/en/coins/bifrost-native-coin
  //   - https://www.coingecko.com/en/coins/weth
  //   - https://www.coingecko.com/en/coins/ethereum
  coingeckoId?: string
  // The origin of this token
  origin: Origin
}

// The supported bridges. Each bridge will have it's own wrapped version of a token
export type Bridge = 'Snowbridge' | 'Other'
export type TokenStandard = 'Native' | 'ERC20' // keep it future proof - Ex: "SPL" Solana Standard

// The origin of a token across supported ecosystems.
// - Native Ethereum tokens:
//   These include both ETH (native) and ERC20 tokens. For example, tokens used directly by Chainflip.
// - Bridged Ethereum tokens:
//   Tokens that are from Ethereum but wrapped by a bridge, such as Snowbridge.
// - Native Polkadot tokens:
//   Tokens that are native to a specific parachain, identified by its parachain Id.
export type Origin =
  | { type: 'Ethereum'; standard: TokenStandard } // Native ETH or ERC20
  | { type: 'Ethereum'; bridge: Bridge } // Snowbridge-wrapped tokens
  | { type: 'Polkadot'; paraId: number } // Native tokens on Polkadot parachains
