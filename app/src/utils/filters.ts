import { REGISTRY } from '@/config/registry'
import { Chain } from '@/models/chain'
import { TokenAmount } from '@/models/select'
import { Token } from '@/models/token'
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

  return chains
}

/** Filters all chains by selected source chain, selected token and available routes */
export const getAllowedDestinationChains = (
  env: Environment,
  chain: Chain | null,
  token: Token | null,
): (Chain & { allowed: boolean })[] => {
  const routes = REGISTRY[env].routes

  return REGISTRY[env].chains.map(c => {
    const isAllowed =
      chain && token
        ? routes.some(
            route =>
              route.from === chain.uid && route.tokens.includes(token.id) && route.to === c.uid,
          )
        : false

    return {
      ...c,
      allowed: isAllowed,
    }
  })
}

/** Filters all tokens by by selected source chain and available routes */
export const getAllowedTokens = (
  env: Environment,
  sourceChain: Chain | null,
): (Token & { allowed: boolean })[] => {
  const routes = REGISTRY[env].routes

  const tokens = REGISTRY[env].tokens.map(token => {
    const isAllowed = sourceChain
      ? routes.some(route => route.from === sourceChain.uid && route.tokens.includes(token.id))
      : false

    return {
      ...token,
      allowed: isAllowed,
    }
  })

  return tokens
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
