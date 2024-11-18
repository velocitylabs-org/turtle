import { Chain } from '@/models/chain'
import { Origin, Token } from '@/models/token'
import { getRelayNode } from '@/utils/paraspell'
import { assets, getNativeAssetSymbol, TCurrencyCore } from '@paraspell/sdk'
import { Environment } from '../store/environmentStore'

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

export const SNOWBRIDGE_MAINNET_PARACHAIN_URLS = [
  rpcConnectionAsHttps(Mainnet.Mythos.rpcConnection),
  rpcConnectionAsHttps(Mainnet.Bifrost.rpcConnection),
  rpcConnectionAsHttps(Mainnet.Hydration.rpcConnection),
  rpcConnectionAsHttps(Mainnet.Moonbeam.rpcConnection),
]

export function getNativeToken(chain: Chain): Token {
  const env = REGISTRY.testnet.chains.map(c => c.uid).includes(chain.uid)
    ? Environment.Testnet
    : Environment.Mainnet

  const relay = getRelayNode(env)
  const chainNode = assets.getTNode(chain.chainId, relay)
  if (!chainNode) throw Error(`Native Token for ${chain.uid} not found`)

  const symbol = getNativeAssetSymbol(chainNode)
  const token = REGISTRY[env].tokens.find(t => t.symbol === symbol) // TODO handle duplicate symbols
  if (!token) throw Error(`Native Token for ${chain.uid} not found`)
  return token
}

export function rpcConnectionAsHttps(rpc?: string): string {
  if (!rpc) return ''
  return rpc.replace('wss://', 'https://')
}

export function getAssetUid(
  env: Environment,
  chainId: string,
  tokenId: string,
): LocalAssetUid | undefined {
  return REGISTRY[env].assetUid.get(chainId)?.get(tokenId)
}

export function isAssetHub(chain: Chain): boolean {
  return chain.network == 'Polkadot' && chain.chainId === 1000
}

export function parachain(paraId: number): Origin {
  return {
    type: 'Polkadot',
    paraId,
  }
}

export function snowbridgeWrapped(): Origin {
  return {
    type: 'Ethereum',
    bridge: 'Snowbridge',
  }
}

// Hack - importing this after types definition to avoid circular dependency and import timing issues
import * as Mainnet from './mainnet'
export * as Mainnet from './mainnet'

import * as Testnet from './testnet'
export * as Testnet from './testnet'
