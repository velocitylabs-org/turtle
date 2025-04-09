import { Chain } from '@/models/chain'
import { TokenAmount } from '@/models/select'
import { Token } from '@/models/token'
import { REGISTRY, Route } from '@/registry'
import { Environment } from '@/store/environmentStore'

/** Filters all chains by available routes. */
export const getAllowedSourceChains = (env: Environment): (Chain & { allowed: boolean })[] => {
  const routes = REGISTRY[env].routes

  const chains = REGISTRY[env].chains.map(chain => {
    const isAllowed = routes.some(route => route.from === chain.uid)

    return {
      ...chain,
      allowed: isAllowed,
    }
  })

  return orderByAllowedTag(chains) as (Chain & { allowed: boolean })[]
}

/** Filters all chains by selected source chain, selected token and available routes */
export const getAllowedDestinationChains = (
  env: Environment,
  chain: Chain | null,
  token: Token | null,
): (Chain & { allowed: boolean })[] => {
  const routes = REGISTRY[env].routes

  const chains = REGISTRY[env].chains.map(c => {
    if (!chain || !token) return { ...c, allowed: false }

    const isAllowed = routes.some(
      route => route.from === chain.uid && route.tokens.includes(token.id) && route.to === c.uid,
    )

    return {
      ...c,
      allowed: isAllowed,
    }
  })

  return orderByAllowedTag(chains) as (Chain & { allowed: boolean })[]
}

/** Filters all tokens by by selected source chain and available routes */
export const getAllowedTokens = (
  env: Environment,
  sourceChain: Chain | null,
  destinationChain: Chain | null,
): (Token & { allowed: boolean })[] => {
  const routes = REGISTRY[env].routes

  const tokens = REGISTRY[env].tokens.map(token => {
    if (!sourceChain) return { ...token, allowed: false }

    const isAllowed = routes.some(
      route =>
        route.from === sourceChain.uid &&
        route.tokens.includes(token.id) &&
        (!destinationChain || route.to === destinationChain.uid),
    )

    return {
      ...token,
      allowed: isAllowed,
    }
  })

  return orderByAllowedTag(tokens) as (Token & { allowed: boolean })[]
}

const orderByAllowedTag = (list: { allowed: boolean }[]) => {
  return list.sort((a, b) => (a.allowed === b.allowed ? 0 : a.allowed ? -1 : 1))
}

/** It checks if a route between two chains exists */
export const isRouteAllowed = (
  environment: Environment,
  fromChain: Chain,
  toChain: Chain,
  tokenAmount?: TokenAmount,
) => {
  const routes = REGISTRY[environment].routes

  if (tokenAmount && tokenAmount.token) {
    const { id } = tokenAmount.token
    return routes.some(
      r => r.from === fromChain.uid && r.to === toChain.uid && r.tokens.includes(id),
    )
  } else {
    return routes.some(r => r.from === fromChain.uid && r.to === toChain.uid)
  }
}

export const isTokenAvailableForSourceChain = (
  env: Environment,
  sourceChain?: Chain | null,
  destinationChain?: Chain | null,
  token?: Token | null,
): boolean => {
  if (!sourceChain || !token) return false
  return getAllowedTokens(env, sourceChain, destinationChain ?? null).some(
    t => t.allowed && t.id === token.id,
  )
}

export const getRoute = (env: Environment, from: Chain, to: Chain): Route | undefined => {
  return REGISTRY[env].routes.find(route => route.from === from.uid && route.to === to.uid)
}
