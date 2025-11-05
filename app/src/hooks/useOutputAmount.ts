import { captureException } from '@sentry/nextjs'
import { useQuery } from '@tanstack/react-query'
import { type Chain, isSameToken, type Token } from '@velocitylabs-org/turtle-registry'
import { useMemo } from 'react'
import type { Sender } from '@/hooks/useTransfer'
import type { FeeDetails } from '@/models/transfer'
import xcmRouterBuilderManager from '@/services/paraspell/xcmRouterBuilder'
import xcmTransferBuilderManager from '@/services/paraspell/xcmTransferBuilder'
import { isChainflipSwap } from '@/utils/chainflip'
import { useChainflipQuote } from './useChainflipQuote'

interface UseOutputAmountParams {
  sourceChain?: Chain | null
  destinationChain?: Chain | null
  sourceToken?: Token | null
  destinationToken?: Token | null
  sourceAmount?: bigint | null
  sender?: Sender | undefined
  recipientAddress?: string
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
  sourceAmount,
  sender,
  recipientAddress,
  fees,
  loadingFees,
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
      sourceAmount?.toString(),
      loadingFees,
    ],
    queryFn: async () => {
      if (
        !sourceChain ||
        !destinationChain ||
        !sourceToken ||
        !destinationToken ||
        !sourceAmount ||
        !sender ||
        !recipientAddress ||
        loadingFees
      )
        return null

      try {
        // Paraspell swap from HydrationDex or AH
        if (!isSameToken(sourceToken, destinationToken)) {
          return await xcmRouterBuilderManager.getExchangeOutputAmount({
            sourceChain,
            destinationChain,
            sourceToken,
            destinationToken,
            sourceAmount,
          })
        }

        // Bridge & XCM transfers (Snowbridge & Paraspell)
        const receivableAmount = await xcmTransferBuilderManager.getReceivableAmount({
          sourceChain,
          destinationChain,
          sourceToken,
          sourceAmount,
          sender,
          recipient: recipientAddress,
        })
        return receivableAmount
          ? receivableAmount
          : calcReceivableAmountManually({ fees, loadingFees, sourceToken, sourceAmount })
      } catch (error) {
        captureException(error, {
          level: 'error',
          extra: {
            sourceChain,
            destinationChain,
            sourceToken,
            destinationToken,
            sourceAmount,
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
      !!sourceAmount &&
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
    amount: sourceAmount?.toString(),
  })

  const outputAmount = useMemo(() => {
    if (!sourceChain || !destinationChain || !sourceToken || !destinationToken || !sourceAmount) return null

    if (isChainflipSwap(sourceChain, destinationChain, sourceToken, destinationToken) && !isChainflipQuoteError) {
      return chainflipQuote ? BigInt(chainflipQuote.egressAmount) : null
    }

    return data
  }, [
    sourceChain,
    destinationChain,
    sourceToken,
    destinationToken,
    sourceAmount,
    chainflipQuote,
    isChainflipQuoteError,
    data,
  ])

  return {
    outputAmount,
    isLoading: isLoading || isFetching || isLoadingChainflipQuote || !!loadingFees,
  }
}

function calcReceivableAmountManually({
  fees,
  sourceToken,
  loadingFees,
  sourceAmount,
}: {
  fees?: FeeDetails[] | null
  sourceToken?: Token | null
  loadingFees?: boolean
  sourceAmount: bigint
}) {
  if (loadingFees || !fees || fees.length === 0 || !sourceToken) return sourceAmount

  let hasMatchingFees = false
  const totalFeesForSourceToken = fees.reduce((sum, fee) => {
    // NOTE: Execution fees (origin fees) & bridging fees are deducted from the sender's balance.
    // The other fees (destination and hop fees) are deducted from the amount being sent.
    if (fee.amount.token?.id === sourceToken.id && fee.title !== 'Execution fees' && fee.title !== 'Bridging fees') {
      hasMatchingFees = true
      return sum + BigInt(fee.amount.amount ?? 0n)
    }
    return sum
  }, 0n)

  // If no fees match the source token, return the full amount
  if (!hasMatchingFees) return sourceAmount

  // Ensure we don't return negative amounts
  if (totalFeesForSourceToken > sourceAmount) return 0n

  return sourceAmount - totalFeesForSourceToken
}
