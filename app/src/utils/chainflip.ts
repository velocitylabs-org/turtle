import { Chain, chainflipRoutes, Token } from '@velocitylabs-org/turtle-registry'

/** returns all Chainflip allowed source chains for a swap. */
export const getChainflipSwapSourceChains = (): Chain[] => {
  return chainflipRoutes.map(route => route.from)
}

/** returns all Chainflip allowed source tokens for a swap. */
export const getChainflipSwapSourceTokens = (sourceChain: Chain): Token[] => {
  if (!sourceChain) return []

  const tokensSet = new Set<Token>()

  chainflipRoutes
    .filter(route => route.from.chainId === sourceChain.chainId)
    .map(route => route.pairs.map(([token, _]) => tokensSet.add(token)))

  return Array.from(tokensSet)
}

/** returns all Chainflip allowed destination chains for a swap. */
export const getChainflipSwapDestChains = (sourceChain: Chain, sourceToken: Token): Chain[] => {
  if (!sourceChain || !sourceToken) return []

  const chainsSet = new Set<Chain>()

  chainflipRoutes.forEach(route => {
    if (
      route.from.chainId === sourceChain.chainId &&
      route.pairs.some(([token, _]) => token.id === sourceToken.id)
    ) {
      chainsSet.add(route.to)
    }
  })

  return Array.from(chainsSet)
}

/** returns all Chainflip allowed destination tokens for a swap. */
export const getChainflipSwapDestTokens = (
  sourceChain: Chain,
  sourceToken: Token,
  destinationChain: Chain | null,
): Token[] => {
  if (!sourceChain || !sourceToken || !destinationChain) return []

  const tokensSet = new Set<Token>()
  const route = chainflipRoutes.find(
    route =>
      route.from.chainId === sourceChain.chainId && route.to.chainId === destinationChain.chainId,
  )
  if (!route) return []

  route.pairs.forEach(([srcT, destT]) => srcT.id === sourceToken.id && tokensSet.add(destT))

  return Array.from(tokensSet)
}
