import { getExchangeAssets, getExchangePairs, RouterBuilder } from '@paraspell/xcm-router'
import {
  Chain,
  Token,
  Environment,
  Hydration,
  REGISTRY,
  getTokenByMultilocation,
  isSameToken,
} from '@velocitylabs-org/turtle-registry'
import { TransferParams } from '@/hooks/useTransfer'
import { SubstrateAccount } from '@/store/substrateWalletStore'
import { isSameChain } from '@/utils/routes'
import { getSenderAddress } from './address'
import { getParaSpellNode, getParaspellToken } from './paraspellTransfer'

// Only supports Hydration for now because trading pairs are not available in xcm-router sdk. And hydration is an omnipool.
/** contains all supported paraspell dexes mapped to the chain they run on */
export const DEX_TO_CHAIN_MAP = {
  HydrationDex: Hydration,
  // AcalaDex: Acala,
  // InterlayDex: Interlay,
  // BifrostPolkadotDex: Bifrost,
} as const

export type Dex = keyof typeof DEX_TO_CHAIN_MAP

export const createRouterPlan = async (params: TransferParams, slippagePct: string = '1') => {
  const {
    sourceChain,
    destinationChain,
    sourceToken,
    destinationToken,
    sourceAmount,
    recipient,
    sender,
  } = params

  const senderAddress = await getSenderAddress(sender)
  const account = params.sender as SubstrateAccount
  const sourceChainFromId = getParaSpellNode(sourceChain)
  const destinationChainFromId = getParaSpellNode(destinationChain)

  if (!sourceChainFromId || !destinationChainFromId)
    throw new Error('Transfer failed: chain id not found.')
  if (sourceChainFromId === 'Ethereum' || destinationChainFromId === 'Ethereum')
    throw new Error('Transfer failed: Ethereum is not supported.')

  const currencyIdFrom = getParaspellToken(sourceToken, sourceChainFromId)
  const currencyTo = getParaspellToken(destinationToken, destinationChainFromId)

  const routerPlan = await RouterBuilder()
    .from(sourceChainFromId)
    .to(destinationChainFromId)
    .exchange('HydrationDex') // only Hydration is supported for now
    .currencyFrom(currencyIdFrom)
    .currencyTo(currencyTo)
    .amount(sourceAmount)
    .slippagePct(slippagePct)
    .senderAddress(senderAddress)
    .recipientAddress(recipient)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .signer(account.pjsSigner as any)
    .buildTransactions()

  return routerPlan
}

export const getExchangeOutputAmount = async (
  sourceChain: Chain,
  destinationChain: Chain,
  sourceToken: Token,
  destinationToken: Token,
  /** Amount in the source token's decimal base */
  amount: string,
): Promise<bigint> => {
  const sourceChainFromId = getParaSpellNode(sourceChain)
  const destinationChainFromId = getParaSpellNode(destinationChain)
  if (!sourceChainFromId || !destinationChainFromId)
    throw new Error('Transfer failed: chain id not found.')
  if (sourceChainFromId === 'Ethereum' || destinationChainFromId === 'Ethereum')
    throw new Error('Transfer failed: Ethereum is not supported.')

  const currencyIdFrom = getParaspellToken(sourceToken, sourceChainFromId)
  const currencyTo = getParaspellToken(destinationToken, destinationChainFromId)

  const amountOut = await RouterBuilder()
    .from(sourceChainFromId)
    .to(destinationChainFromId)
    .exchange('HydrationDex') // TODO: hardcoded for now as it's the only dex supported.
    .currencyFrom(currencyIdFrom)
    .currencyTo(currencyTo)
    .amount(amount)
    .getBestAmountOut()

  return amountOut.amountOut
}

/** returns all supported dex paraspell nodes */
export const getSupportedDexNodes = () => Object.keys(DEX_TO_CHAIN_MAP)

/** returns all supported dex chains */
export const getSupportedDexChains = () => Object.values(DEX_TO_CHAIN_MAP)

/** returns the paraspell dex for a given chain */
export const getDex = (chain: Chain): Dex | undefined => {
  const entry = Object.entries(DEX_TO_CHAIN_MAP).find(([_, c]) => c.uid === chain.uid)
  return entry?.[0] as Dex | undefined
}

/** returns all tokens supported by a dex */
export const getDexTokens = (dex: Dex): Token[] =>
  getExchangeAssets(dex)
    .map(asset => (asset.multiLocation ? getTokenByMultilocation(asset.multiLocation) : undefined))
    .filter((token): token is Token => token !== undefined)

/** returns all pairs supported by a dex */
export const getDexPairs = (dex: Dex | [Dex, Dex, ...Dex[]]): [Token, Token][] => {
  const pairs = getExchangePairs(dex)
  const turtlePairs = pairs
    .map(pair => {
      const [token1, token2] = pair
      if (!token1.multiLocation || !token2.multiLocation) return null

      const t1 = getTokenByMultilocation(token1.multiLocation)
      const t2 = getTokenByMultilocation(token2.multiLocation)
      if (!t1 || !t2) return null // not supported by turtle registry
      return [t1, t2] as [Token, Token]
    })
    .filter((pair): pair is [Token, Token] => pair !== null)
  return turtlePairs
}

/** returns all allowed source chains for a swap. */
export const getSwapsSourceChains = (): Chain[] => getSupportedDexChains()

/** returns all allowed source tokens for a swap. Currently only supports 1-signature flows. */
export const getSwapsSourceTokens = (sourceChain: Chain | null): Token[] => {
  if (!sourceChain) return []

  const dex = getDex(sourceChain)
  if (!dex) return []

  const pairs = getDexPairs(dex)
  const uniqueTokens = new Map(
    pairs.flatMap(([token1, token2]) => [
      [token1.id, token1],
      [token2.id, token2],
    ]),
  )

  return Array.from(uniqueTokens.values())
}

/** returns all allowed destination chains for a swap. Only supports 1-signature flows at the moment. */
export const getSwapsDestinationChains = (
  sourceChain: Chain | null,
  sourceToken: Token | null,
): Chain[] => {
  if (!sourceChain || !sourceToken) return []
  const chains: Chain[] = []

  // add dex chain itself
  const dex = getDex(sourceChain)
  if (!dex) return []
  chains.push(sourceChain)

  const dexTokens = new Set(getDexTokens(dex).map(token => token.id)) // Use Set for O(1) lookups
  if (!dexTokens.has(sourceToken.id)) return []

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

// TODO: use trading pairs once available in xcm-router sdk. Enables support for non-omnipool dexes.
/** returns all allowed destination tokens for a swap. */
export const getSwapsDestinationTokens = (
  sourceChain: Chain | null,
  sourceToken: Token | null,
  destinationChain: Chain | null,
): Token[] => {
  if (!sourceChain || !sourceToken || !destinationChain) return []

  const dex = getDex(sourceChain)
  if (!dex) return []
  const dexTokens = getDexTokens(dex)

  if (!dexTokens.some(token => isSameToken(token, sourceToken))) return []

  const dexTokensWithoutSourceToken = dexTokens.filter(token => !isSameToken(token, sourceToken))
  if (isSameChain(sourceChain, destinationChain)) return dexTokensWithoutSourceToken

  // if destination chain is different, filter tokens by routes
  const route = REGISTRY[Environment.Mainnet].routes.find(
    route => route.from === sourceChain.uid && route.to === destinationChain.uid,
  )
  if (!route) return []

  return dexTokensWithoutSourceToken.filter(token => route.tokens.includes(token.id))
}
