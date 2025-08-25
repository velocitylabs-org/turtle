import { captureException } from '@sentry/nextjs'
import { useQuery } from '@tanstack/react-query'
import { type Chain, isSameToken, type Token } from '@velocitylabs-org/turtle-registry'
import { useMemo } from 'react'
import type { FeeDetails } from '@/models/transfer'
import xcmRouterBuilderManager from '@/services/paraspell/xcmRouterBuilder'
import { isChainflipSwap } from '@/utils/chainflip'
import { DEX_TO_CHAIN_MAP } from '@/utils/paraspellSwap'
import { useChainflipQuote } from './useChainflipQuote'

interface UseOutputAmountParams {
  sourceChain?: Chain | null
  destinationChain?: Chain | null
  sourceToken?: Token | null
  destinationToken?: Token | null
  /** Amount in the source token's decimal base */
  amount?: string | null
  /** Fees are used to calculate the output amount for transfers */
  fees?: FeeDetails[] | null
  loadingFees?: boolean
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
  loadingFees,
}: UseOutputAmountParams): OutputAmountResult {
  // Calculate total fees for the source token
  const totalFeesForSourceToken = useMemo(() => {
    if (loadingFees || !fees || fees.length === 0 || !sourceToken) return null

    let hasMatchingFees = false
    const total = fees.reduce((sum, fee) => {
      if (fee.amount.token?.id === sourceToken.id) {
        hasMatchingFees = true
        return sum + BigInt(fee.amount.amount ?? 0n)
      }
      return sum
    }, 0n)

    // Return null if no fees match the source token, otherwise return the total
    return hasMatchingFees ? total : null
  }, [fees, sourceToken, loadingFees])

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
      loadingFees,
      totalFeesForSourceToken?.toString() ?? 'no-fees',
    ],
    queryFn: async () => {
      if (!sourceChain || !destinationChain || !sourceToken || !destinationToken || !amount || loadingFees) return null

      try {
        // Paraspell swap from HydrationDex
        if (!isSameToken(sourceToken, destinationToken) && sourceChain === DEX_TO_CHAIN_MAP.HydrationDex) {
          const params = {
            sourceChain,
            destinationChain,
            sourceToken,
            destinationToken,
            sourceAmount: amount,
          }
          return await xcmRouterBuilderManager.getExchangeOutputAmount(params)
        }

        // Bridge & XCM transfers (Snowbridge & Paraspell)
        if (!totalFeesForSourceToken) return BigInt(amount)

        const amountBigInt = BigInt(amount)
        if (totalFeesForSourceToken > amountBigInt) return 0n
        return amountBigInt - totalFeesForSourceToken
      } catch (error) {
        captureException(error, {
          level: 'error',
          extra: {
            sourceChain,
            destinationChain,
            sourceToken,
            destinationToken,
            amount,
          },
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
      !loadingFees &&
      !isChainflipSwap(sourceChain, destinationChain, sourceToken, destinationToken),
    staleTime: 10000, // Cache results for 10 seconds
    retry: 2, // Retry failed requests twice
  })

  // The following hook (react-query) is used to fetch chainflip quote.
  // The quote defined the swap output amount.
  const { chainflipQuote, isLoadingChainflipQuote, isChainflipQuoteError } = useChainflipQuote({
    sourceChain,
    destinationChain,
    sourceToken,
    destinationToken,
    amount,
  })

  const outputAmount = useMemo(() => {
    if (!sourceChain || !destinationChain || !sourceToken || !destinationToken || !amount) return null

    if (isChainflipSwap(sourceChain, destinationChain, sourceToken, destinationToken) && !isChainflipQuoteError) {
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
    isLoading: isLoading || isFetching || isLoadingChainflipQuote || !!loadingFees,
  }
}
