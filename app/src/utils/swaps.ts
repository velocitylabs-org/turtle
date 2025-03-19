import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { REGISTRY } from '@/registry'
import { Hydration } from '@/registry/mainnet/chains'
import { Environment } from '@/store/environmentStore'
import { getExchangeAssets, TRouterAsset } from '@paraspell/xcm-router'

// Only supports Hydration for now because trading pairs are not available in xcm-router sdk. And hydration is an omnipool.
/** contains all supported paraspell dexes mapped to the chain they run on */
export const DEX_TO_CHAIN_MAP = {
  HydrationDex: Hydration,
  // AcalaDex: Acala,
  // InterlayDex: Interlay,
  // BifrostPolkadotDex: Bifrost,
} as const

export type Dex = keyof typeof DEX_TO_CHAIN_MAP

/** returns all supported dex paraspell nodes */
export const getSupportedDexNodes = () => Object.keys(DEX_TO_CHAIN_MAP)

/** returns all supported dex chains */
export const getSupportedDexChains = () => Object.values(DEX_TO_CHAIN_MAP)

/** returns true if the chain is a dex chain */
export const isDexChain = (chain: Chain) =>
  getSupportedDexChains().some(dex => dex.uid === chain.uid)

/** returns the paraspell dex for a given chain */
export const getDex = (chain: Chain): Dex | undefined => {
  const entry = Object.entries(DEX_TO_CHAIN_MAP).find(([_, c]) => c.uid === chain.uid)
  return entry?.[0] as Dex | undefined
}

/** returns all tokens supported by a dex */
export const getDexTokens = (dex: Dex): Token[] =>
  getExchangeAssets(dex)
    .map(asset => getTokenByRouterAsset(asset))
    .filter((token): token is Token => token !== undefined)

// TODO: work in progress. Currently rely on symbol only.
/** returns a turtle token by a paraspell router asset */
export const getTokenByRouterAsset = (asset: TRouterAsset): Token | undefined => {
  const token = REGISTRY[Environment.Mainnet].tokens.find(t => t.symbol === asset.symbol)
  return token
}

/** returns all allowed source chains for a swap. */
export const getSwapsSourceChains = (): Chain[] => getSupportedDexChains()

/** returns all allowed source tokens for a swap. Currently only supports 1-signature flows. */
export const getSwapsSourceTokens = (sourceChain: Chain): Token[] => {
  const dex = getDex(sourceChain)
  if (!dex) return []

  return getDexTokens(dex)
}

/** returns all allowed destination chains for a swap. Only supports 1-signature flows at the moment. */
export const getSwapsDestinationChains = (sourceChain: Chain, _sourceToken: Token): Chain[] => {
  let chains: Chain[] = []

  // add dex chain itself
  const dex = getDex(sourceChain)
  if (!dex) return []
  chains.push(sourceChain)

  const dexTokens = new Set(getDexTokens(dex).map(token => token.id)) // Use Set for O(1) lookups

  // get transfer routes we can reach from the source chain
  const routes = REGISTRY[Environment.Mainnet].routes.filter(
    route => route.from === sourceChain.uid,
  )

  // TODO: filter routes by dex trading pairs. A route needs to support a token from the dex trading pairs together with the source token
  // waiting for trading pairs to be available in xcm-router sdk. For now it simply checks tokens in the route.
  // Check for routes that have at least one token supported by the dex
  routes.forEach(route => {
    if (route.tokens.some(tokenId => dexTokens.has(tokenId))) {
      // lookup destination chain and add it to the list
      const destinationChain = REGISTRY[Environment.Mainnet].chains.find(
        chain => chain.uid === route.to,
      )
      if (destinationChain) chains.push(destinationChain)
    }
  })

  return chains
}

/** returns all allowed destination tokens for a swap. */
// TODO: implement
export const getSwapsDestinationTokens = (destinationChain: Chain): Token[] => {
  return []
}
