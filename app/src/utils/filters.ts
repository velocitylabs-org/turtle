import { REGISTRY } from '@/config/registry'
import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { Environment } from '@/store/environmentStore'

/** Filters all chains by compatibility for the selected destination and token. */
export const getFilteredSourceChains = (env: Environment) => {
  const routes = REGISTRY[env].routes

  const chains = REGISTRY[env].chains.map(chain => {
    const isAllowed = routes.some(route => route.from === chain.uid)

    return {
      ...chain,
      allowed: isAllowed,
    }
  })

  return {
    chains,
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
  const isTokenInRoute = !!token && getRoute.length > 0 && getRoute[0].tokens.includes(token.id)

  return {
    isRouteAllowed: getRoute.length > 0,
    isTokenInRoute,
  }
}
