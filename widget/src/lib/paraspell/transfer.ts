import {
  getAllAssetsSymbols,
  getNativeAssetSymbol,
  getTChain,
  type TChain,
  type TCurrencyCore,
  type TDryRunResult,
} from '@paraspell/sdk'
import {
  ArbitrumTokens,
  BridgeHub,
  type Chain,
  EthereumTokens,
  MainnetRegistry,
  REGISTRY,
  type Token,
} from '@velocitylabs-org/turtle-registry'
import { removeWhitespace } from '@/utils/strings.ts'

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

  if (!tokenSymbol) console.error(`Token symbol not found: ${token.symbol} on ${sourceChain}`)
  // captureException(new Error(`Token symbol not found: ${token.symbol} on ${sourceChain}`)) - Sentry

  return tokenSymbol ?? token.symbol // if not found, try with fallback
}

export function getNativeToken(chain: Chain): Token {
  if (chain.network === 'Ethereum') return EthereumTokens.ETH
  if (chain.network === 'Arbitrum') return ArbitrumTokens.ETH

  const ecosystem = chain.network
  const chainNode = getTChain(chain.chainId, ecosystem)
  if (!chainNode) throw Error(`ChainNode with id ${chain.uid} not found in ${ecosystem}`)

  const symbol = getNativeAssetSymbol(chainNode)
  const token = REGISTRY.tokens.find(t => t.symbol === symbol) // TODO handle duplicate symbols
  if (!token) throw Error(`Native Token for ${chain.uid} not found`)
  return token
}

export function getParaSpellChain(chain: Chain): TChain | null {
  if (chain.network === 'Arbitrum') return null
  return chain.network === 'Ethereum' && chain.chainId === 1 ? 'Ethereum' : getTChain(chain.chainId, chain.network)
}

/**
 * Get the ParaSpell token. Used to convert a turtle token to a paraspell token object.
 */
export function getParaspellToken(token: Token, chain?: TChain): TCurrencyCore {
  // Edge Cases. Myth multilocation is not supported by Paraspell.
  if (token.id === EthereumTokens.MYTH.id)
    return chain ? { symbol: getTokenSymbol(chain, token) } : { symbol: token.symbol }

  if (token.location) return { location: token.location }
  if (chain) return { symbol: getTokenSymbol(chain, token) }

  return { symbol: token.symbol }
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
