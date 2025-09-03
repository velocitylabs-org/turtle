import { getExchangePairs } from '@paraspell/xcm-router'
import {
  type Chain,
  getTokenByMultilocation,
  Hydration,
  isSameToken,
  REGISTRY,
  type Token,
} from '@velocitylabs-org/turtle-registry'
import { deduplicate, isSameChain } from '@/utils/routes'

// We only support Hydration for now.
/** contains all supported paraspell dexes mapped to the chain they run on */
const DEX_TO_CHAIN_MAP = {
  HydrationDex: Hydration,
} as const

export type Dex = keyof typeof DEX_TO_CHAIN_MAP

/** returns all supported dex chains */
const getSupportedDexChains = () => Object.values(DEX_TO_CHAIN_MAP)

/** returns the paraspell dex for a given chain */
const getDex = (chain: Chain): Dex | undefined => {
  const entry = Object.entries(DEX_TO_CHAIN_MAP).find(([, c]) => c.uid === chain.uid)
  return entry?.[0] as Dex | undefined
}

/** returns all tokens supported by a dex that are also supported by our registry and have at least one trading pair */
const getDexTokens = (dex: Dex): Token[] => {
  const pairs = getDexPairs(dex)

  const uniqueTokens = new Map(
    pairs.flatMap(([token1, token2]) => [
      [token1.id, token1],
      [token2.id, token2],
    ]),
  )

  return Array.from(uniqueTokens.values())
}

/** returns all pairs supported by a dex and supported by our registry */
const getDexPairs = (dex: Dex | [Dex, Dex, ...Dex[]]): [Token, Token][] => {
  const pairs = getExchangePairs(dex)
  const turtlePairs = pairs
    .map(pair => {
      const [token1, token2] = pair
      if (!token1.multiLocation || !token2.multiLocation) return null

      const t1 = getTokenByMultilocation(token1.multiLocation)
      const t2 = getTokenByMultilocation(token2.multiLocation)
      if (!t1 || !t2) return null // not supported by turtle registry
      return [t1, t2] as [Token, Token]
    })
    .filter((pair): pair is [Token, Token] => pair !== null)
  return turtlePairs
}

/** returns all tokens that can be traded with the given source token on the specified dex */
const getTradeableTokens = (dex: Dex, sourceToken: Token): Token[] => {
  const dexPairs = getDexPairs(dex)
  const tradeableTokens = new Set<Token>()

  dexPairs.forEach(([token1, token2]) => {
    if (isSameToken(token1, sourceToken)) {
      tradeableTokens.add(token2)
    } else if (isSameToken(token2, sourceToken)) {
      tradeableTokens.add(token1)
    }
  })

  return Array.from(tradeableTokens)
}

/** returns all allowed source chains for a swap. */
export const getSwapsSourceChains = (): Chain[] => {
  const chainsSupportingOneClickFlow = REGISTRY.chains.filter(chain => chain?.supportExecuteExtrinsic)

  const oneClickChains = chainsSupportingOneClickFlow.filter(chain => {
    const route = REGISTRY.routes.find(route => route.from === chain.uid && route.to === Hydration.uid)
    if (!route) return false

    const isTradingPairCompatible = getDexPairs('HydrationDex').some(pair =>
      pair.some(token => route.tokens.includes(token.id)),
    )
    return isTradingPairCompatible
  })

  return deduplicate(getSupportedDexChains(), ...oneClickChains)
}

/** returns all allowed source tokens for a swap. */
export const getSwapsSourceTokens = (sourceChain: Chain | null): Token[] => {
  if (!sourceChain) return []

  const dex = getDex(sourceChain)
  if (dex) return getDexTokens(dex)

  if (!sourceChain.supportExecuteExtrinsic) return []

  const routeToDex = REGISTRY.routes.find(route => route.from === sourceChain.uid && route.to === Hydration.uid)
  if (!routeToDex) return []

  const dexTokens = getDexPairs('HydrationDex')

  const tokenIdsWithTradingPair = routeToDex.tokens.filter(tokenId =>
    dexTokens.some(pair => pair.some(token => token.id === tokenId)),
  )

  const tokensWithTradingPair = tokenIdsWithTradingPair
    .map(tokenId => REGISTRY.tokens.find(token => token.id === tokenId))
    .filter((token): token is Token => token !== undefined)

  return tokensWithTradingPair
}

/** returns all allowed destination chains for a swap. */
export const getSwapsDestinationChains = (sourceChain: Chain | null, sourceToken: Token | null): Chain[] => {
  if (!sourceChain || !sourceToken) return []
  const chains: Chain[] = []

  const dex = getDex(sourceChain)
  if (!dex && !sourceChain.supportExecuteExtrinsic) return []

  const tradeableTokens = getTradeableTokens('HydrationDex', sourceToken)
  if (tradeableTokens.length === 0) return []
  chains.push(sourceChain)

  // get transfer routes we can reach from the dex
  const routes = REGISTRY.routes.filter(route => route.from === Hydration.uid)

  // Filter routes by dex trading pairs. A route needs to support at least one tradable token of the dex
  routes.forEach(route => {
    if (route.tokens.some(routeTokenId => tradeableTokens.some(tradeableToken => tradeableToken.id === routeTokenId))) {
      // lookup destination chain and add it to the list
      const destinationChain = REGISTRY.chains.find(chain => chain.uid === route.to)
      if (destinationChain) chains.push(destinationChain)
    }
  })

  return chains
}

/** returns all allowed destination tokens for a swap. */
export const getSwapsDestinationTokens = (
  sourceChain: Chain | null,
  sourceToken: Token | null,
  destinationChain: Chain | null,
): Token[] => {
  if (!sourceChain || !sourceToken || !destinationChain) return []

  const dex = getDex(sourceChain)
  if (!dex && !sourceChain.supportExecuteExtrinsic) return []

  // Check for tradeable tokens
  const tradeableTokens = getTradeableTokens('HydrationDex', sourceToken)
  if (tradeableTokens.length === 0) return []
  if (isSameChain(Hydration, destinationChain)) return tradeableTokens

  // Check if we can reach the destination chain
  const route = REGISTRY.routes.find(route => route.from === Hydration.uid && route.to === destinationChain.uid)
  if (!route) return []

  const tradeableAndTransferableTokens = tradeableTokens.filter(tradeableToken =>
    route.tokens.includes(tradeableToken.id),
  )

  return tradeableAndTransferableTokens
}
