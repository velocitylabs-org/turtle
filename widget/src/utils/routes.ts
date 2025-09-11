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
} from '@/lib/paraspell/swap'

/** Deduplicates a list of items based on their uid/id property. Used for chains and tokens. */
export const deduplicate = <T extends { uid?: string; id?: string }>(items: T[], ...moreItems: T[]): T[] => {
  const combinedItems = [...items, ...moreItems]
  const itemMap = new Map(combinedItems.map(item => [item.uid || item.id, item]))
  return Array.from(itemMap.values())
}

/** Filters all tokens by selected source chain and available routes */
const getTransferTokens = (
  sourceChain: Chain | null,
  destinationChain: Chain | null,
  allowedTokens?: Token['id'][] | undefined,
): Token[] => {
  if (!sourceChain) return []

  const filteredTokens =
    Array.isArray(allowedTokens) && allowedTokens.length > 0
      ? MainnetRegistry.tokens.filter(token => allowedTokens.includes(token.id))
      : MainnetRegistry.tokens

  return filteredTokens.filter(token =>
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
  } else {
    return routes.some(r => r.from === fromChain.uid && r.to === toChain.uid)
  }
}

export const isTokenAvailableForSourceChain = (
  sourceChain?: Chain | null,
  destinationChain?: Chain | null,
  token?: Token | null,
  allowedTokens?: Token['id'][] | undefined,
): boolean => {
  if (!sourceChain || !token) return false
  return getTransferTokens(sourceChain, destinationChain ?? null, allowedTokens).some(t => t.id === token.id)
}

const getAllowedSourceChains = (allowedChains?: Chain['uid'][]): Chain[] => {
  const filteredChains =
    Array.isArray(allowedChains) && allowedChains.length > 0
      ? MainnetRegistry.chains.filter(chain => allowedChains.includes(chain.uid))
      : MainnetRegistry.chains

  // Filters all chains by available routes
  const transferSourceChains = filteredChains.filter(chain =>
    MainnetRegistry.routes.some(route => route.from === chain.uid),
  )

  const swapSourceChains = allowedChains
    ? getSwapsSourceChains().filter(chain => allowedChains.includes(chain.uid))
    : getSwapsSourceChains()

  return deduplicate([...transferSourceChains, ...swapSourceChains])
}

export const sourceChainOptions = getAllowedSourceChains()

export const getAllowedSourceTokens = (
  sourceChain: Chain | null,
  destinationChain: Chain | null,
  allowedTokens?: Token['id'][] | undefined,
): Token[] => {
  if (!sourceChain) return []

  const transferTokens = getTransferTokens(sourceChain, destinationChain, allowedTokens)
  const swapTokens = getSwapsSourceTokens(sourceChain)

  return deduplicate([...transferTokens, ...swapTokens])
}

export const getAllowedDestinationChains = (
  sourceChain: Chain | null,
  sourceToken: Token | null,
  allowedChains?: Chain['uid'][],
): Chain[] => {
  if (!sourceChain || !sourceToken) return []

  const filteredChains =
    Array.isArray(allowedChains) && allowedChains.length > 0
      ? MainnetRegistry.chains.filter(chain => allowedChains.includes(chain.uid))
      : MainnetRegistry.chains

  // Filters all chains by selected source chain, selected token and available routes
  const transferDestinationChains = filteredChains.filter(c =>
    MainnetRegistry.routes.some(
      route => route.from === sourceChain.uid && route.tokens.includes(sourceToken.id) && route.to === c.uid,
    ),
  )
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

const getRoute = (from: Chain, to: Chain): Route | undefined => {
  return MainnetRegistry.routes.find(route => route.from === from.uid && route.to === to.uid)
}

export const isSameChain = (chain1: Chain, chain2: Chain): boolean => {
  return chain1.uid === chain2.uid
}

const isSamePolkadotChain = (sourceChain?: Chain | null, destinationChain?: Chain | null): boolean => {
  return Boolean(
    sourceChain && destinationChain && isSameChain(sourceChain, destinationChain) && sourceChain.network === 'Polkadot',
  )
}

export const resolveSdk = (sourceChain?: Chain | null, destinationChain?: Chain | null): TransferSDK | undefined => {
  if (!sourceChain || !destinationChain) return

  return isSamePolkadotChain(sourceChain, destinationChain)
    ? 'ParaSpellApi'
    : getRoute(sourceChain, destinationChain)?.sdk
}
