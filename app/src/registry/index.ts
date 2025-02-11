import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { Environment } from '@/store/environmentStore'
import { TCurrencyCore } from '@paraspell/sdk'
import { rpcConnectionAsHttps } from './helpers'
import { AssetHub, Bifrost, BridgeHub, Hydration, Moonbeam, Mythos } from './mainnet/chains'
import { Mainnet } from './mainnet/mainnet'
import { Testnet } from './testnet/testnet'

export type TransferSDK = 'SnowbridgeApi' | 'ParaSpellApi'

// A Turtle-defined unique chain identifier
export type ChainUId = string
// A Turtle-defined unique token identifier
export type TokenId = string
// An unambiguous reference to a an asset within the local context of a chain,
// either the token symbol or the asset id at a given chain
export type LocalAssetUid = TCurrencyCore

export interface Registry {
  chains: Chain[]
  tokens: Token[]
  routes: Route[]
  // Assets are often uniquely identified by a "asset id" at each chain, making it a chain-dependant value.
  // The SDKs we use accept the token symbol as the indexing value to work with a given token but some chains
  // might have said token registered with a different symbol (for example with a different pre or suffix),
  // or have multiple tokens with the same symbol, in which case we need this map to provide the exact asset
  // symbol or id at that given chain to disambiguate.
  assetUid: Map<ChainUId, Map<TokenId, LocalAssetUid>>
}

export interface Route {
  from: string
  to: string
  sdk: TransferSDK
  tokens: string[]
}

export const REGISTRY = {
  mainnet: Mainnet.REGISTRY,
  testnet: Testnet.REGISTRY,
}

export const SNOWBRIDGE_MAINNET_PARACHAIN_URLS: { [paraId: string]: string } = {
  // Asset Hub
  '1000': rpcConnectionAsHttps(AssetHub.rpcConnection),
  // Bridge Hub
  '1002': rpcConnectionAsHttps(BridgeHub.rpcConnection),
  // Moonbeam
  '2004': rpcConnectionAsHttps(Moonbeam.rpcConnection),
  // Bifrost
  '2030': rpcConnectionAsHttps(Bifrost.rpcConnection),
  // Hydration
  '2034': rpcConnectionAsHttps(Hydration.rpcConnection),
  // Mythos
  '3369': rpcConnectionAsHttps(Mythos.rpcConnection),
}

export function getAssetUid(
  env: Environment,
  chainId: string,
  tokenId: string,
): LocalAssetUid | undefined {
  return REGISTRY[env].assetUid.get(chainId)?.get(tokenId)
}
