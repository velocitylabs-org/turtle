import {
  AssetData,
  ChainData,
  DCAQuote,
  DepositAddressResponseV2,
  RegularQuote,
  SwapSDK,
} from '@chainflip/sdk/swap'
import {
  Chain,
  chainflipRoutes,
  EthereumTokens,
  MainnetRegistry,
  PolkadotTokens,
  Token,
} from '@velocitylabs-org/turtle-registry'
import { AmountInfo } from '@/models/transfer'
import { useChainflipSdk } from '@/store/chainflipStore'
import { getChainSpecificAddress } from './address'

/** TYPES */
export type AssetSymbol = 'DOT' | 'USDC' | 'USDT' | 'ETH' | 'FLIP' | 'BTC' | 'SOL'

export type ChainflipChain =
  | 'Ethereum'
  | 'Polkadot'
  | 'Assethub'
  | 'Arbitrum'
  | 'Bitcoin'
  | 'Solana'

export type ChainflipFeeType = 'NETWORK' | 'INGRESS' | 'EGRESS' | 'BROKER' | 'BOOST' | 'REFUND'

export type ChainflipFee = { type: ChainflipFeeType } & AmountInfo

export type ChainflipQuote = RegularQuote | DCAQuote

type ChainflipError = {
  response?: {
    data?: {
      message?: string
    }
  }
}

/** ROUTES HELPERS */

/** Returns all Chainflip allowed source chains for a swap. */
export const getChainflipSwapSourceChains = (): Chain[] => {
  return chainflipRoutes.map(route => route.from)
}

/** Returns all Chainflip allowed source tokens for a swap. */
export const getChainflipSwapSourceTokens = (sourceChain: Chain): Token[] => {
  if (!sourceChain) return []

  const tokensSet = new Set<Token>()

  chainflipRoutes
    .filter(route => route.from.chainId === sourceChain.chainId)
    .map(route => route.pairs.map(([token, _]) => tokensSet.add(token)))

  return Array.from(tokensSet)
}

/** Returns all Chainflip allowed destination chains for a swap. */
export const getChainflipSwapDestChains = (sourceChain: Chain, sourceToken: Token): Chain[] => {
  if (!sourceChain || !sourceToken) return []

  const chainsSet = new Set<Chain>()

  chainflipRoutes.forEach(route => {
    if (
      route.from.chainId === sourceChain.chainId &&
      route.pairs.some(([token, _]) => token.id === sourceToken.id)
    ) {
      chainsSet.add(route.to)
    }
  })

  return Array.from(chainsSet)
}

/** Returns all Chainflip allowed destination tokens for a swap. */
export const getChainflipSwapDestTokens = (
  sourceChain: Chain,
  sourceToken: Token,
  destinationChain: Chain | null,
): Token[] => {
  if (!sourceChain || !sourceToken || !destinationChain) return []

  const tokensSet = new Set<Token>()
  const route = chainflipRoutes.find(
    route =>
      route.from.chainId === sourceChain.chainId && route.to.chainId === destinationChain.chainId,
  )
  if (!route) return []

  route.pairs.forEach(([srcT, destT]) => srcT.id === sourceToken.id && tokensSet.add(destT))

  return Array.from(tokensSet)
}

/** CORE SDK HELPERS */

/**
 * Get Chainflip SDK instance.
 * It creates a new instance if not already initialized.
 */
export const getChainflipSdk = (): SwapSDK => useChainflipSdk.getState().initSdk()

/** Get Chainflip quote for a swap. */
export const getChainflipQuote = async (
  sourceChain: Chain,
  destinationChain: Chain,
  sourceToken: Token,
  destinationToken: Token,
  /** Amount in the source token's decimal base */
  amount: string,
): Promise<ChainflipQuote | null> => {
  const sdk = getChainflipSdk()
  if (!sdk) throw new Error('Chainflip SDK not initialized.')
  const srcChain = await getChainflipChain(sourceChain)
  const destChain = await getChainflipChain(destinationChain)
  if (!srcChain || !destChain) throw new Error('Chainflip chain not found')
  const srcAsset = await getChainflipAsset(sourceToken, srcChain)
  const destAsset = await getChainflipAsset(destinationToken, destChain)
  if (!srcAsset || !destAsset) throw new Error('Chainflip token not found')

  if (!meetChainflipMinSwapAmount(amount, srcAsset)) return null

  //Fetch quotes for swap
  try {
    const { quotes } = await sdk.getQuoteV2({
      srcChain: srcChain.chain,
      srcAsset: srcAsset.symbol,
      destChain: destChain.chain,
      destAsset: destAsset.symbol,
      isVaultSwap: isVaultSwapSupported(srcChain, destChain),
      brokerCommissionBps: 0,
      amount,
    })

    //Find regular quote
    const regularQuote = quotes.find(quote => quote.type === 'REGULAR')
    //Find DCA quote
    const dcaQuote = quotes.find(quote => quote.type === 'DCA')
    if (!regularQuote && !dcaQuote) throw new Error('Chainflip quote not found.')

    return regularQuote ? regularQuote : (dcaQuote ?? null)
  } catch (error) {
    const chainflipErrorMsg = (error as ChainflipError).response?.data?.message

    if (chainflipErrorMsg) {
      throw formatChainflipErrorMsg(chainflipErrorMsg)
    }

    throw error as Error
  }
}

/** Generates the deposit address for a swap. */
export const getDepositAddress = async (
  quote: RegularQuote | DCAQuote,
  senderAddress?: string,
  destinationAddress?: string,
): Promise<DepositAddressResponseV2 | null> => {
  try {
    if (!senderAddress || !destinationAddress) return null
    const sdk = getChainflipSdk()
    if (!sdk) throw new Error('Chainflip SDK not initialized.')

    const formattedSenderAddress = getChainSpecificAddress(
      senderAddress,
      toRegistryChain(quote.srcAsset.chain),
    )

    const formattedDestinationAddress = getChainSpecificAddress(
      destinationAddress,
      toRegistryChain(quote.destAsset.chain),
    )

    const swapDepositAddressRequest = {
      quote,
      srcAddress: formattedSenderAddress,
      destAddress: formattedDestinationAddress,
      fillOrKillParams: {
        slippageTolerancePercent: quote.recommendedSlippageTolerancePercent, // use recommended slippage tolerance from quote
        refundAddress: senderAddress, // address to which assets are refunded
        retryDurationBlocks: 100, // 100 blocks * 6 seconds = 10 minutes before deposits are refunded
      },
    }
    return await sdk.requestDepositAddressV2(swapDepositAddressRequest)
  } catch (error) {
    console.log('requestDepositAddressV2 error', error)
    const chainflipErrorMsg = (error as ChainflipError).response?.data?.message

    if (chainflipErrorMsg) {
      throw formatChainflipErrorMsg(chainflipErrorMsg)
    }

    throw error as Error
  }
}

/** Returns a Chainflip chain matching with Turtle chain. */
export const getChainflipChain = async (chain: Chain): Promise<ChainData | undefined> => {
  const sdk = getChainflipSdk()
  if (!sdk) throw new Error('Chainflip SDK not initialized.')
  const chainflipChains = await sdk.getChains()

  // Here we map through chainflipChains and find the chain that matches Turtle chain.uid.
  // Considering chainflipChains data, it can only be Ethereum or Polkadot
  const chainsMatch = chainflipChains.find(c => {
    return c.chain.toLowerCase() === chain.uid.toLowerCase()
  })

  const assethub = chainflipChains.find(c => c.chain === 'Assethub')

  // If no match is found, we default to Assethub as this is the only remaining chain supported
  return chainsMatch ?? assethub
}

/** Returns a Turtle Chain matching with Chainflip chain. */
export const toRegistryChain = (ChainflipChain: ChainflipChain): Chain => {
  const registryChain = MainnetRegistry.chains.find(c => {
    if (c.uid.includes('-'))
      return c.uid.split('-')[1].toLowerCase() === ChainflipChain.toLowerCase()
    return c.uid.toLowerCase() === ChainflipChain.toLowerCase()
  })
  if (!registryChain) throw new Error('No registry chain match with a Chainflip chain')
  return registryChain
}

/** Returns a Chainflip asset matching with Turtle token. */
export const getChainflipAsset = async (
  asset: Token,
  chainflipChain: ChainData,
): Promise<AssetData> => {
  const sdk = getChainflipSdk()
  if (!sdk) throw new Error('Chainflip SDK not initialized.')
  const assetFromSrcChain = await sdk.getAssets(chainflipChain.chain)

  const assetMatch = assetFromSrcChain.find(a => {
    // First try to match by Ethereum contract address otherwise by symbol
    return a.contractAddress
      ? a.contractAddress.toLowerCase() === asset.address.toLowerCase()
      : a.symbol.toLowerCase() === asset.symbol.toLowerCase()
  })

  if (!assetMatch) throw new Error('Chainflip token not found')
  return assetMatch
}

/** Check if the swap is supported by Chainflip and match our Chainflip routes registry. */
export const isChainflipSwap = (
  sourceChain: Chain,
  destinationChain: Chain,
  sourceToken: Token,
  destinationToken: Token,
): boolean => {
  return chainflipRoutes.some(
    route =>
      route.from.chainId === sourceChain.chainId &&
      route.to.chainId === destinationChain.chainId &&
      route.pairs.some(
        ([srcToken, dstToken]) =>
          srcToken.id === sourceToken.id && dstToken.id === destinationToken.id,
      ),
  )
}

/** Check if the amount is greater than the minimum swap amount for the asset. */
export const meetChainflipMinSwapAmount = (amount: string | bigint, asset: AssetData): boolean => {
  return BigInt(amount) >= BigInt(asset.minimumSwapAmount)
}

/** Check if the source chain is supported for vault swap (Assethub is not supported and uses the deposit address method) */
export const isVaultSwapSupported = (sourceChain: ChainData, destChain: ChainData): boolean =>
  sourceChain.chain !== 'Assethub' && destChain.chain !== 'Assethub'

export const getFeeTokenFromAssetSymbol = (
  assetSymbol: AssetSymbol,
  chain: ChainflipChain,
): Token => {
  if (chain === 'Ethereum') return EthereumTokens[assetSymbol]
  switch (assetSymbol) {
    case 'USDC':
      return PolkadotTokens.USDC
    case 'USDT':
      return PolkadotTokens.USDT
    default:
      return PolkadotTokens.DOT
  }
}

export const getFeeLabelFromType = (feeType: ChainflipFeeType): string => {
  switch (feeType) {
    case 'BROKER':
      return 'Broker fee'
    case 'NETWORK':
      return 'Execution fee'
    case 'INGRESS':
      return 'Deposit fee'
    case 'EGRESS':
      return 'Broadcast fee'
    default:
      return 'Fee'
  }
}

export const getChainflipDurationEstimate = (
  quote?: RegularQuote | DCAQuote | null,
): string | null => {
  if (!quote) return null
  return `~${Math.ceil(quote.estimatedDurationSeconds / 60)} min`
}

export const formatChainflipErrorMsg = (errorMsg: string): string | null => {
  if (!errorMsg) return null
  const capitalized = errorMsg.charAt(0).toUpperCase() + errorMsg.slice(1)
  return capitalized.endsWith('.') ? capitalized : `${capitalized}. `
}
