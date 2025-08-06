import { captureException } from '@sentry/nextjs'
import { useQuery } from '@tanstack/react-query'
import { Chain, Token, isSameToken } from '@velocitylabs-org/turtle-registry'
import { useMemo } from 'react'
import { AmountInfo } from '@/models/transfer'
import { isChainflipSwap } from '@/utils/chainflip'
import { DEX_TO_CHAIN_MAP, getExchangeOutputAmount } from '@/utils/paraspellSwap'
import { useChainflipQuote } from './useChainflipQuote'

interface UseOutputAmountParams {
  sourceChain?: Chain | null
  destinationChain?: Chain | null
  sourceToken?: Token | null
  destinationToken?: Token | null
  /** Amount in the source token's decimal base */
  amount?: string | null
  /** Fees are used to calculate the output amount for transfers */
  fees?: AmountInfo | null
}

interface OutputAmountResult {
  outputAmount: bigint | null | undefined
  isLoading: boolean
}

export function useOutputAmount({
  sourceChain,
  destinationChain,
  sourceToken,
  destinationToken,
  amount,
  fees,
}: UseOutputAmountParams): OutputAmountResult {
  // The following react-query is used to fetch the output amount for:
  // A swap made from HydrationDex with Paraspell
  // A bridge or XCM transfer made from Snowbridge or Paraspell
  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      'outputAmount',
      sourceChain?.uid,
      destinationChain?.uid,
      sourceToken?.id,
      destinationToken?.id,
      amount,
      fees?.token.id,
      fees?.amount.toString(),
    ],
    queryFn: async () => {
      if (!sourceChain || !destinationChain || !sourceToken || !destinationToken || !amount)
        return null

      try {
        // Paraspell swap from HydrationDex
        if (
          !isSameToken(sourceToken, destinationToken) &&
          sourceChain === DEX_TO_CHAIN_MAP.HydrationDex
        ) {
          return await getExchangeOutputAmount(
            sourceChain,
            destinationChain,
            sourceToken,
            destinationToken,
            amount,
          )
        }

        // Bridge & XCM transfers (Snowbridge & Paraspell)
        if (!fees || fees.token.id !== sourceToken.id) return BigInt(amount)

        const amountBigInt = BigInt(amount)
        const feesBigInt = BigInt(fees.amount)
        if (feesBigInt > amountBigInt) return 0n
        return amountBigInt - feesBigInt
      } catch (error) {
        captureException(error, {
          level: 'error',
          extra: { sourceChain, destinationChain, sourceToken, destinationToken, amount },
        })
        console.error('Failed to fetch swap output amount:', error)
        return null
      }
    },
    enabled:
      !!sourceChain &&
      !!destinationChain &&
      !!sourceToken &&
      !!destinationToken &&
      !!amount &&
      !isChainflipSwap(sourceChain, destinationChain, sourceToken, destinationToken),
    staleTime: 10000, // Cache results for 10 seconds
    retry: 2, // Retry failed requests twice
  })

  // The following hook (react-query) is used to fetch chainflip quote.
  // The quote defined the swap output amount.
  const {
    chainflipQuote,
    isLoadingChainflipQuote,
    isFetchingChainflipQuote,
    isChainflipQuoteError,
  } = useChainflipQuote({
    sourceChain,
    destinationChain,
    sourceToken,
    destinationToken,
    amount,
  })

  const outputAmount = useMemo(() => {
    if (!sourceChain || !destinationChain || !sourceToken || !destinationToken || !amount)
      return null

    if (
      isChainflipSwap(sourceChain, destinationChain, sourceToken, destinationToken) &&
      !isChainflipQuoteError
    ) {
      return chainflipQuote ? BigInt(chainflipQuote.egressAmount) : null
    }

    return data
  }, [
    sourceChain,
    destinationChain,
    sourceToken,
    destinationToken,
    amount,
    chainflipQuote,
    isChainflipQuoteError,
    data,
  ])

  return {
    outputAmount,
    isLoading: isLoading || isFetching || isLoadingChainflipQuote || isFetchingChainflipQuote,
  }
}
