import { REGISTRY } from '@/config/registry'
import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { Environment } from '@/store/environmentStore'

/** Filters all chains by compatibility for the selected destination and token. */
export const getFilteredSourceChains = (
  env: Environment,
  destinationChain: Chain | null,
  token: Token | null,
) => {
  if (!destinationChain || !token) return

  const sourceChains: string[] = []
  const sourceChainsData = REGISTRY[env].routes.filter(r => {
    if (r.to === destinationChain.uid && r.tokens.includes(token.id)) {
      sourceChains.push(r.from)
      return r
    }
  })

  return {
    sourceChainsData,
    sourceChains,
  }
}

/** Filters all chains by compatibility for the selected source and token. */
export const getFilteredDestinationChains = (
  env: Environment,
  sourceChain: Chain | null,
  token: Token | null,
) => {
  if (!sourceChain || !token) return

  const destinationChains: string[] = []
  const destinationChainsData = REGISTRY[env].routes.filter(r => {
    if (r.from === sourceChain.uid && r.tokens.includes(token.id)) {
      destinationChains.push(r.to)
      return r
    }
  })

  return {
    destinationChainsData,
    destinationChains,
  }
}

/** Filters all tokens by compatibility for the selected source and destination chain. */
export const getFilteredTokens = (
  env: Environment,
  sourceChain: Chain | null,
  destinationChain: Chain | null,
) => {
  if (!sourceChain || !destinationChain) return

  const tokens: string[] = []
  REGISTRY[env].routes.filter(r => {
    if (r.from === sourceChain.uid && r.to === destinationChain.uid) {
      tokens.push(...r.tokens)
    }
  })

  return {
    tokens,
  }
}

/** Check is a route is allowed. */
export const isRouteAllowed = (
  env: Environment,
  sourceChain: Chain | null,
  destinationChain: Chain | null,
  token: Token | null,
) => {
  if (!sourceChain || !destinationChain) return

  const getRoute = REGISTRY[env].routes.filter(
    r => r.from === destinationChain.uid && r.to === sourceChain.uid,
  )
  const isTokenInRoute = token && getRoute.length && getRoute[0].tokens.includes(token.id)

  return {
    isRouteAllowed: getRoute.length,
    isTokenInRoute,
  }
}
