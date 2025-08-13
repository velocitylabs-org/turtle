import { rpcConnectionAsHttps } from './helpers'
import { AssetHub, Bifrost, BridgeHub, Hydration, MainnetRegistry, Moonbeam, Mythos } from './mainnet'
import type { Chain, LocalAssetUid, Token } from './types'

const SNOWBRIDGE_MAINNET_PARACHAINS = [AssetHub, BridgeHub, Moonbeam, Bifrost, Hydration, Mythos]

export const REGISTRY = MainnetRegistry

export const tokensById = MainnetRegistry.tokens.reduce<Record<string, Token>>((acc, token) => {
  acc[token.id] = token
  return acc
}, {})

export const chainsByUid = MainnetRegistry.chains.reduce<Record<string, Chain>>((acc, chain) => {
  acc[chain.uid] = chain
  return acc
}, {})

export const SNOWBRIDGE_MAINNET_PARACHAIN_URLS = Object.fromEntries(
  SNOWBRIDGE_MAINNET_PARACHAINS.map(chain => [chain.chainId.toString(), rpcConnectionAsHttps(chain.rpcConnection)]),
)

export function getAssetUid(chainId: string, tokenId: string): LocalAssetUid | undefined {
  return REGISTRY.assetUid.get(chainId)?.get(tokenId)
}

export * from './constants'
export * from './helpers'
export * from './mainnet'
export * from './types'
export * from './utils'
