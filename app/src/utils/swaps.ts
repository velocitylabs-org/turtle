import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { REGISTRY } from '@/registry'
import { Acala, Bifrost, Hydration, Interlay } from '@/registry/mainnet/chains'
import { Environment } from '@/store/environmentStore'

/** contains all supported paraspell dexes mapped to the chain they run on */
export const DEX_TO_CHAIN_MAP = {
  HydrationDex: Hydration,
  AcalaDex: Acala,
  InterlayDex: Interlay,
  BifrostPolkadotDex: Bifrost,
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

// TODO: implement this once available
/** returns all token pairs supported by a dex */
export const getDexTokenPairs = (dex: Dex) => {
  return []
}

/** returns all allowed source chains for a swap. */
export const getSwapsSourceChains = () => getSupportedDexChains()

/** returns all allowed source tokens for a swap. Currently only supports 1-signature flows. */
export const getSwapsSourceTokens = (sourceChain: Chain) => {
  const dex = getDex(sourceChain)
  if (!dex) return []

  const tokenPairs = getDexTokenPairs(dex)
  // TODO: process token pairs
  return []
}

/** returns all allowed destination chains for a swap. Only supports 1-signature flows at the moment. */
// TODO deduplicate chains
export const getSwapsDestinationChains = (sourceChain: Chain, sourceToken: Token) => {
  let chains = []

  // add dex chain itself
  const dex = getDex(sourceChain)
  if (!dex) return []
  chains.push(dex)

  // get allowed transfer routes
  const routes = REGISTRY[Environment.Mainnet].routes.filter(
    route => route.from === sourceChain.uid,
  )

  // TODO: filter routes by dex trading pairs. A route needs to support a token from the dex trading pairs together with the source token
  routes.forEach(route => {
    const routeSupportsTradingPair = route.tokens.some(token => {
      // TODO: check if token is a dex trading pair
    })

    if (routeSupportsTradingPair) chains.push(route.to)
  })

  // TODO: deduplicate chains
  return chains
}

/** returns all allowed destination tokens for a swap. */
export const getSwapsDestinationTokens = (destinationChain: Chain) => {}
