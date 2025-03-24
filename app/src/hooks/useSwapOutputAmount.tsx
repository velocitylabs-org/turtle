import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { getExchangeOutputAmount } from '@/utils/paraspellSwap'
import { useQuery } from '@tanstack/react-query'

interface UseSwapOutputAmountParams {
  sourceChain: Chain | null
  destinationChain: Chain | null
  sourceToken: Token | null
  destinationToken: Token | null
  amount: string | null
  enabled?: boolean
}

export function useSwapOutputAmount({
  sourceChain,
  destinationChain,
  sourceToken,
  destinationToken,
  amount,
  enabled = true,
}: UseSwapOutputAmountParams) {
  return useQuery({
    queryKey: [
      'swapOutputAmount',
      sourceChain?.uid,
      destinationChain?.uid,
      sourceToken?.id,
      destinationToken?.id,
      amount,
    ],
    queryFn: async () => {
      if (!sourceChain || !destinationChain || !sourceToken || !destinationToken || !amount) {
        return null
      }

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
        console.error('Failed to fetch swap output amount:', error)
        throw error
      }
    },
    enabled:
      enabled &&
      !!sourceChain &&
      !!destinationChain &&
      !!sourceToken &&
      !!destinationToken &&
      !!amount,
    staleTime: 10000, // Cache results for 10 seconds
    retry: 2, // Retry failed requests twice
  })
}
