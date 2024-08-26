import { REGISTRY } from '@/config/registry'
import { Chain } from '@/models/chain'
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

  const orderedChains = chains.sort((a, b) => (a.allowed === b.allowed ? 0 : a.allowed ? -1 : 1))

  return orderedChains
}

/** Filters all chains by selected source chain, selected token and available routes */
export const getAllowedDestinationChains = (
  env: Environment,
  sourceChain: Chain | null,
  token: Token | null,
): (Chain & { allowed: boolean })[] => {
  const routes = REGISTRY[env].routes

  const chains = REGISTRY[env].chains.map(chain => {
    const isAllowed =
      sourceChain && token
        ? routes.some(
            route =>
              route.from === sourceChain.uid &&
              route.tokens.includes(token.id) &&
              route.to === chain.uid,
          )
        : false
    return {
      ...chain,
      allowed: isAllowed,
    }
  })

  const orderedChains = chains.sort((a, b) => (a.allowed === b.allowed ? 0 : a.allowed ? -1 : 1))

  return orderedChains
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

  const orderedTokens = tokens.sort((a, b) => (a.allowed === b.allowed ? 0 : a.allowed ? -1 : 1))

  return orderedTokens
}
