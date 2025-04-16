import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { getExchangeOutputAmount } from '@/lib/paraspellSwap'
import { isSameToken } from '@/utils/token'
import { useQuery } from '@tanstack/react-query'

interface UseSwapOutputAmountParams {
  sourceChain?: Chain | null
  destinationChain?: Chain | null
  sourceToken?: Token | null
  destinationToken?: Token | null
  /** Amount in the source token's decimal base */
  amount?: string | null
}

interface SwapOutputAmountResult {
  outputAmount: bigint | null | undefined
  isLoading: boolean
}

export function useSwapOutputAmount({
  sourceChain,
  destinationChain,
  sourceToken,
  destinationToken,
  amount,
}: UseSwapOutputAmountParams): SwapOutputAmountResult {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      'swapOutputAmount',
      sourceChain?.uid,
      destinationChain?.uid,
      sourceToken?.id,
      destinationToken?.id,
      amount,
    ],
    queryFn: async () => {
      if (!sourceChain || !destinationChain || !sourceToken || !destinationToken || !amount)
        return null

      if (isSameToken(sourceToken, destinationToken)) return null

      try {
        const output = await getExchangeOutputAmount(
          sourceChain,
          destinationChain,
          sourceToken,
          destinationToken,
          amount,
        )
        return output
      } catch (error) {
        // captureException(error, {
        //   level: 'error',
        //   extra: { sourceChain, destinationChain, sourceToken, destinationToken, amount },
        // }) - Sentry
        console.error('Failed to fetch swap output amount:', error)
        return null
      }
    },
    enabled: !!sourceChain && !!destinationChain && !!sourceToken && !!destinationToken && !!amount,
    staleTime: 10000, // Cache results for 10 seconds
    retry: 2, // Retry failed requests twice
  })

  return {
    outputAmount: data,
    isLoading: isLoading || isFetching,
  }
}
