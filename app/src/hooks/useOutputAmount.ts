import { captureException } from '@sentry/nextjs'
import { useQuery } from '@tanstack/react-query'
import { type Chain, isSameToken, type Token } from '@velocitylabs-org/turtle-registry'
import { useMemo } from 'react'
import type { FeeDetails } from '@/models/transfer'
import xcmRouterBuilderManager from '@/services/paraspell/xcmRouterBuilder'

interface UseOutputAmountParams {
  sourceChain?: Chain | null
  destinationChain?: Chain | null
  sourceToken?: Token | null
  destinationToken?: Token | null
  /** Amount in the source token's decimal base */
  amount?: string | null
  /** Fees are used to calculate the output amount for transfers */
  fees?: FeeDetails[] | null
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
  // Calculate total fees for the source token
  const totalFeesForSourceToken = useMemo(() => {
    if (!fees || !sourceToken) return null

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
  }, [fees, sourceToken])

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      'outputAmount',
      sourceChain?.uid,
      destinationChain?.uid,
      sourceToken?.id,
      destinationToken?.id,
      amount,
      totalFeesForSourceToken?.toString(),
    ],
    queryFn: async () => {
      if (!sourceChain || !destinationChain || !sourceToken || !destinationToken || !amount) return null

      try {
        if (!isSameToken(sourceToken, destinationToken)) {
          // Swap
          const params = {
            sourceChain,
            destinationChain,
            sourceToken,
            destinationToken,
            sourceAmount: amount,
          }
          return await xcmRouterBuilderManager.getExchangeOutputAmount(params)
        }

        // Normal transfer
        if (!totalFeesForSourceToken) return BigInt(amount)

        const amountBigInt = BigInt(amount)
        if (totalFeesForSourceToken > amountBigInt) return 0n
        return amountBigInt - totalFeesForSourceToken
      } catch (error) {
        captureException(error, {
          level: 'error',
          extra: { sourceChain, destinationChain, sourceToken, destinationToken, amount },
        })
        console.error('Failed to fetch swap output amount:', error)
        return null
      }
    },
    enabled: !!sourceChain && !!destinationChain && !!sourceToken && !!destinationToken && !!amount,
    staleTime: 10000, // Cache results for 10 seconds
    retry: 2, // Retry failed requests twice
  })

  return useMemo(
    () => ({
      outputAmount: data,
      isLoading: isLoading || isFetching,
    }),
    [data, isLoading, isFetching],
  )
}
