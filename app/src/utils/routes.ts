import { Chain } from '@/models/chain'
import { TokenAmount } from '@/models/select'
import { Token } from '@/models/token'
import { Route } from '@/registry'
import { WithAllowedTag } from '@/registry/helpers'
import { REGISTRY } from '@/registry/mainnet/mainnet'
import {
  getSwapsDestinationChains,
  getSwapsDestinationTokens,
  getSwapsSourceChains,
  getSwapsSourceTokens,
} from './paraspellSwaps'

/** Filters all chains by available routes. */
export const getTransferSourceChains = (): WithAllowedTag<Chain>[] => {
  const routes = REGISTRY.routes

  const chains = REGISTRY.chains.map(chain => {
    const isAllowed = routes.some(route => route.from === chain.uid)

    return {
      ...chain,
      allowed: isAllowed,
    }
  })

  return orderByAllowedTag(chains)
}

/** Filters all chains by selected source chain, selected token and available routes */
export const getTransferDestinationChains = (
  chain: Chain | null,
  token: Token | null,
): WithAllowedTag<Chain>[] => {
  const routes = REGISTRY.routes

  const chains = REGISTRY.chains.map(c => {
    if (!chain || !token) return { ...c, allowed: false }

    const isAllowed = routes.some(
      route => route.from === chain.uid && route.tokens.includes(token.id) && route.to === c.uid,
    )

    return {
      ...c,
      allowed: isAllowed,
    }
  })

  return orderByAllowedTag(chains)
}

/** Filters all tokens by by selected source chain and available routes */
export const getTransferTokens = (
  sourceChain: Chain | null,
  destinationChain: Chain | null,
): WithAllowedTag<Token>[] => {
  const routes = REGISTRY.routes

  const tokens = REGISTRY.tokens.map(token => {
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

  return orderByAllowedTag(tokens)
}

const orderByAllowedTag = <T extends WithAllowedTag<unknown>>(list: T[]): T[] => {
  return [...list].sort((a, b) => (a.allowed === b.allowed ? 0 : a.allowed ? -1 : 1))
}

/** It checks if a route between two chains exists */
export const isRouteAllowed = (fromChain: Chain, toChain: Chain, tokenAmount?: TokenAmount) => {
  const routes = REGISTRY.routes

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
  sourceChain?: Chain | null,
  destinationChain?: Chain | null,
  token?: Token | null,
): boolean => {
  if (!sourceChain || !token) return false
  return getTransferTokens(sourceChain, destinationChain ?? null).some(
    t => t.allowed && t.id === token.id,
  )
}

export const getRoute = (from: Chain, to: Chain): Route | undefined => {
  return REGISTRY.routes.find(route => route.from === from.uid && route.to === to.uid)
}

export const isSameChain = (chain1: Chain, chain2: Chain): boolean => {
  return chain1.uid === chain2.uid
}

export const getAllowedSourceChains = (): Chain[] => {
  const transferSourceChains = getTransferSourceChains()
  const swapSourceChains = getSwapsSourceChains()

  // deduplicate
  const chainMap = new Map(
    [...transferSourceChains, ...swapSourceChains].map(chain => [chain.uid, chain]),
  )

  return Array.from(chainMap.values())
}

export const getAllowedSourceTokens = (
  sourceChain: Chain | null,
  destinationChain: Chain | null,
): Token[] => {
  const transferTokens = getTransferTokens(sourceChain, destinationChain)
  const swapTokens = getSwapsSourceTokens(sourceChain)

  // deduplicate
  const tokenMap = new Map([...transferTokens, ...swapTokens].map(token => [token.id, token]))

  return Array.from(tokenMap.values())
}

export const getAllowedDestinationChains = (
  sourceChain: Chain | null,
  sourceToken: Token | null,
): Chain[] => {
  const transferDestinationChains = getTransferDestinationChains(sourceChain, sourceToken)
  const swapDestinationChains = getSwapsDestinationChains(sourceChain, sourceToken)

  // deduplicate
  const chainMap = new Map(
    [...transferDestinationChains, ...swapDestinationChains].map(chain => [chain.uid, chain]),
  )

  return Array.from(chainMap.values())
}

export const getAllowedDestinationTokens = (
  sourceChain: Chain | null,
  sourceToken: Token | null,
  destinationChain: Chain | null,
): Token[] => {
  const transferTokens = getTransferTokens(sourceChain, destinationChain)
  const swapTokens = getSwapsDestinationTokens(sourceChain, sourceToken, destinationChain)

  // deduplicate
  const tokenMap = new Map([...transferTokens, ...swapTokens].map(token => [token.id, token]))

  return Array.from(tokenMap.values())
}
