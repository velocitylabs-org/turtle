import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { getAssetUid, REGISTRY } from '@/registry'
import { EthereumTokens } from '@/registry/mainnet/tokens'
import { Environment } from '@/stores/environmentStore'
import {
  getAllAssetsSymbols,
  getNativeAssetSymbol,
  getTNode,
  TCurrencyCore,
  TNodeWithRelayChains,
} from '@paraspell/sdk'

export const getTokenSymbol = (sourceChain: TNodeWithRelayChains, token: Token) => {
  const supportedAssets = getAllAssetsSymbols(sourceChain)

  let tokenSymbol: string | undefined
  if (sourceChain === 'Moonbeam') {
    tokenSymbol = supportedAssets.find(a => {
      const lowered = a.toLowerCase()
      const stripped = lowered.startsWith('xc') ? lowered.slice(2) : lowered
      return stripped === token.symbol.toLowerCase()
    })
  } else tokenSymbol = supportedAssets.find(a => a.toLowerCase() === token.symbol.toLowerCase())

  if (!tokenSymbol) console.error(`Token symbol not found: ${token.symbol} on ${sourceChain}`)
  // captureException(new Error(`Token symbol not found: ${token.symbol} on ${sourceChain}`)) - Sentry

  return tokenSymbol ?? token.symbol // if not found, try with fallback
}

export const getRelayNode = (env: Environment): 'polkadot' => {
  switch (env) {
    case Environment.Mainnet:
      return 'polkadot'

    case Environment.Testnet:
      return 'polkadot' // TODO: change to Paseo once available

    default:
      throw new Error('Cannot find relay node. Unsupported environment')
  }
}

export function getCurrencyId(
  env: Environment,
  node: TNodeWithRelayChains,
  chainId: string,
  token: Token,
): TCurrencyCore {
  return getAssetUid(env, chainId, token.id) ?? { symbol: getTokenSymbol(node, token) }
}

export function getNativeToken(chain: Chain): Token {
  if (chain.network === 'Ethereum') return EthereumTokens.ETH

  const env = REGISTRY.testnet.chains.map(c => c.uid).includes(chain.uid)
    ? Environment.Testnet
    : Environment.Mainnet

  const relay = getRelayNode(env)
  const chainNode = getTNode(chain.chainId, relay)
  if (!chainNode) throw Error(`Native Token for ${chain.uid} not found`)

  const symbol = getNativeAssetSymbol(chainNode)
  const token = REGISTRY[env].tokens.find(t => t.symbol === symbol) // TODO handle duplicate symbols
  if (!token) throw Error(`Native Token for ${chain.uid} not found`)
  return token
}
