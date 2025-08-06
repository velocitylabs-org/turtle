import {
  type Chain,
  isSameToken,
  MainnetRegistry,
  type Route,
  type Token,
  type TokenAmount,
  type TransferSDK,
} from '@velocitylabs-org/turtle-registry'

import {
  getSwapsDestinationChains,
  getSwapsDestinationTokens,
  getSwapsSourceChains,
  getSwapsSourceTokens,
} from './paraspellSwap'

/** Deduplicates a list of items based on their uid/id property. Used for chains and tokens. */
export const deduplicate = <T extends { uid?: string; id?: string }>(
  items: T[],
  ...moreItems: T[]
): T[] => {
  const combinedItems = [...items, ...moreItems]
  const itemMap = new Map(combinedItems.map(item => [item.uid || item.id, item]))
  return Array.from(itemMap.values())
}

/** Filters all chains by available routes. */
export const getTransferSourceChains = (): Chain[] => {
  return MainnetRegistry.chains.filter(chain => MainnetRegistry.routes.some(route => route.from === chain.uid))
}

/** Filters all chains by selected source chain, selected token and available routes */
export const getTransferDestinationChains = (sourceChain: Chain | null, token: Token | null): Chain[] => {
  if (!sourceChain || !token) return []

  return MainnetRegistry.chains.filter(c =>
    MainnetRegistry.routes.some(
      route => route.from === sourceChain.uid && route.tokens.includes(token.id) && route.to === c.uid,
    ),
  )
}

/** Filters all tokens by selected source chain and available routes */
export const getTransferTokens = (sourceChain: Chain | null, destinationChain: Chain | null): Token[] => {
  if (!sourceChain) return []

  return MainnetRegistry.tokens.filter(token =>
    MainnetRegistry.routes.some(
      route =>
        route.from === sourceChain.uid &&
        route.tokens.includes(token.id) &&
        (!destinationChain || route.to === destinationChain.uid),
    ),
  )
}

/** It checks if a route between two chains exists */
export const isRouteAllowed = (fromChain: Chain, toChain: Chain, tokenAmount?: TokenAmount) => {
  const routes = MainnetRegistry.routes

  if (tokenAmount?.token) {
    const { id } = tokenAmount.token
    return routes.some(r => r.from === fromChain.uid && r.to === toChain.uid && r.tokens.includes(id))
  }

  return routes.some(r => r.from === fromChain.uid && r.to === toChain.uid)
}

export const isTokenAvailableForSourceChain = (
  sourceChain?: Chain | null,
  destinationChain?: Chain | null,
  token?: Token | null,
): boolean => {
  if (!sourceChain || !token) return false
  return getTransferTokens(sourceChain, destinationChain ?? null).some(t => t.id === token.id)
}

export const getAllowedSourceChains = (): Chain[] => {
  const transferSourceChains = getTransferSourceChains()
  const swapSourceChains = getSwapsSourceChains()

  return deduplicate([...transferSourceChains, ...swapSourceChains])
}

export const getAllowedSourceTokens = (sourceChain: Chain | null, destinationChain: Chain | null): Token[] => {
  if (!sourceChain) return []

  const transferTokens = getTransferTokens(sourceChain, destinationChain)
  const swapTokens = getSwapsSourceTokens(sourceChain)

  return deduplicate([...transferTokens, ...swapTokens])
}

export const getAllowedDestinationChains = (sourceChain: Chain | null, sourceToken: Token | null): Chain[] => {
  if (!sourceChain || !sourceToken) return []

  const transferDestinationChains = getTransferDestinationChains(sourceChain, sourceToken)
  const swapDestinationChains = getSwapsDestinationChains(sourceChain, sourceToken)

  return deduplicate([...transferDestinationChains, ...swapDestinationChains])
}

export const getAllowedDestinationTokens = (
  sourceChain: Chain | null,
  sourceToken: Token | null,
  destinationChain: Chain | null,
): Token[] => {
  if (!sourceChain || !sourceToken || !destinationChain) return []

  const includeSourceTokenForTransfer =
    !isSameChain(sourceChain, destinationChain) &&
    getTransferTokens(sourceChain, destinationChain).some(t => isSameToken(t, sourceToken))

  const swapTokens = getSwapsDestinationTokens(sourceChain, sourceToken, destinationChain)

  const allowedTokens = [...(includeSourceTokenForTransfer ? [sourceToken] : []), ...swapTokens]

  return deduplicate(allowedTokens)
}

export const getRoute = (from: Chain, to: Chain): Route | undefined => {
  return MainnetRegistry.routes.find(route => route.from === from.uid && route.to === to.uid)
}

export const isSameChain = (chain1: Chain, chain2: Chain): boolean => {
  return chain1.uid === chain2.uid
}

export const resolveSdk = (sourceChain?: Chain | null, destinationChain?: Chain | null): TransferSDK | undefined => {
  if (!sourceChain || !destinationChain) {
    return
  }

  const isSamePolkadotChain = isSameChain(sourceChain, destinationChain) && sourceChain.network === 'Polkadot'

  return isSamePolkadotChain ? 'ParaSpellApi' : getRoute(sourceChain, destinationChain)?.sdk
}
