import {
  findAssetInfo,
  getAllAssetsSymbols,
  getNativeAssetSymbol,
  getTChain,
  type TChain,
  type TCurrencyCore,
  type TDryRunResult,
} from '@paraspell/sdk'
import { captureException } from '@sentry/nextjs'
import {
  BridgeHub,
  type Chain,
  EthereumTokens,
  MainnetRegistry,
  REGISTRY,
  type Token,
} from '@velocitylabs-org/turtle-registry'
import { removeWhitespace } from '@/utils/strings'

export type DryRunResult = { type: 'Supported' | 'Unsupported' } & TDryRunResult

const getTokenSymbol = (sourceChain: TChain, token: Token) => {
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

/**
 * Get the ParaSpell token. Used to convert a turtle token to a paraspell token object.
 */
export function getParaspellToken(token: Token, chain?: TChain): TCurrencyCore {
  if (token.id === EthereumTokens.MYTH.id)
    return chain ? { symbol: getTokenSymbol(chain, token) } : { symbol: token.symbol }

  if (token.location) return { location: token.location }
  if (chain) return { symbol: getTokenSymbol(chain, token) }

  return { symbol: token.symbol }
}

export function getNativeToken(chain: Chain): Token {
  if (chain.network === 'Ethereum') return EthereumTokens.ETH

  const ecosystem = chain.network
  const chainNode = getTChain(chain.chainId, ecosystem)
  if (!chainNode) throw Error(`ChainNode with id ${chain.uid} not found in ${ecosystem}`)

  const symbol = getNativeAssetSymbol(chainNode)
  const token = REGISTRY.tokens.find(t => t.symbol === symbol) // TODO handle duplicate symbols
  if (!token) throw Error(`Native Token for ${chain.uid} not found`)
  return token
}

export function getParaSpellChain(chain: Chain): TChain | null {
  return chain.network === 'Ethereum' && chain.chainId === 1 ? 'Ethereum' : getTChain(chain.chainId, chain.network)
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

  const chainNode = getParaSpellChain(chain)
  if (!chainNode) return false

  const currency = getParaspellToken(token, chainNode)
  const asset = findAssetInfo(chainNode, currency, null)

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

export function moonbeamSymbolToRegistry(tokenSymbol: string): string {
  const moonbeamErc20Prefix = 'xc'
  if (tokenSymbol.startsWith(moonbeamErc20Prefix)) {
    return tokenSymbol.slice(moonbeamErc20Prefix.length)
  }
  return tokenSymbol
}
