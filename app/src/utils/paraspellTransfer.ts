import {
  findAsset,
  getAllAssetsSymbols,
  getNativeAssetSymbol,
  getTNode,
  type TCurrencyCore,
  type TDryRunResult,
  type TEcosystemType,
  type TNodeWithRelayChains,
} from '@paraspell/sdk'
import { captureException } from '@sentry/nextjs'
import {
  BridgeHub,
  type Chain,
  EthereumTokens,
  MainnetRegistry,
  type Network,
  REGISTRY,
  type Token,
} from '@velocitylabs-org/turtle-registry'
import { removeWhitespace } from '@/utils/strings'

export type DryRunResult = { type: 'Supported' | 'Unsupported' } & TDryRunResult

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

  if (!tokenSymbol) captureException(new Error(`Token symbol not found: ${token.symbol} on ${sourceChain}`))

  return tokenSymbol ?? token.symbol // if not found, try with fallback
}

export const getRelayNode = (network: Network): 'polkadot' | 'kusama' => {
  switch (network) {
    case 'Polkadot':
      return 'polkadot'
    case 'Kusama':
      return 'kusama'
    default:
      throw new Error('Cannot find relay node. Unsupported environment')
  }
}

/**
 * Get the ParaSpell token. Used to convert a turtle token to a paraspell token object.
 */
export function getParaspellToken(token: Token, node?: TNodeWithRelayChains): TCurrencyCore {
  if (token.id === EthereumTokens.MYTH.id)
    return node ? { symbol: getTokenSymbol(node, token) } : { symbol: token.symbol }

  if (token.multilocation) return { multilocation: token.multilocation }
  if (node) return { symbol: getTokenSymbol(node, token) }

  return { symbol: token.symbol }
}

/**
 * Convert a Turtle 'network' value to a ParaSpell 'TEcosystemType'
 * @param network
 * @returns the matching paraspell value
 */
export function toPsEcosystem(network: Network): TEcosystemType {
  return network.toLowerCase() as TEcosystemType
}

export function getNativeToken(chain: Chain): Token {
  if (chain.network === 'Ethereum') return EthereumTokens.ETH

  const ecosystem = toPsEcosystem(chain.network)
  const chainNode = getTNode(chain.chainId, ecosystem)
  if (!chainNode) throw Error(`ChainNode with id ${chain.uid} not found in ${ecosystem}`)

  const symbol = getNativeAssetSymbol(chainNode)
  const token = REGISTRY.tokens.find(t => t.symbol === symbol) // TODO handle duplicate symbols
  if (!token) throw Error(`Native Token for ${chain.uid} not found`)
  return token
}

export function getParaSpellNode(chain: Chain): TNodeWithRelayChains | null {
  return chain.network === 'Ethereum' && chain.chainId === 1
    ? 'Ethereum'
    : getTNode(chain.chainId, toPsEcosystem(chain.network))
}

/**
 * Check if a chain supports a token.
 *
 * @param chain - The chain to check.
 * @param token - The token that should be supported.
 * @returns - A boolean indicating if the chain supports the token.
 */
export function isChainSupportingToken(chain: Chain | null, token: Token | null): boolean {
  if (!chain || !token) return false

  const node = getParaSpellNode(chain)
  if (!node) return false

  const currency = getParaspellToken(token, node)
  const asset = findAsset(node, currency, null)

  return !!asset
}

export function mapParaspellChainToTurtleRegistry(chainName: string): Chain {
  const map: Record<string, string> = {
    AssetHubPolkadot: 'AssetHub',
    BridgeHubPolkadot: 'BridgeHub',
    BifrostPolkadot: 'Bifrost',
    AssetHubKusama: 'KusamaAssetHub',
  }
  const name = map[chainName] ?? chainName
  // BridgeHub is not part of the main registry, so we need to add it manually
  const chain = [...MainnetRegistry.chains, BridgeHub].find(c => removeWhitespace(c.name) === removeWhitespace(name))
  if (!chain) {
    throw new Error(`Chain not found for name: ${chainName}`)
  }
  return chain
}
