import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { AmountInfo } from '@/models/transfer'
import { getExchangeOutputAmount } from '@/utils/paraspellSwap'
import { isSameToken } from '@/utils/token'
import { captureException } from '@sentry/nextjs'
import { useQuery } from '@tanstack/react-query'

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
        console.log(
          fees,
          sourceToken.id,
          destinationToken.id,
          fees?.token.id === sourceToken.id,
          fees?.amount,
        )
        // Normal transfer
        if (isSameToken(sourceToken, destinationToken)) {
          if (fees && fees.token.id === sourceToken.id) return BigInt(amount) - BigInt(fees.amount)
          return BigInt(amount)
        }

        // Swap
        const output = await getExchangeOutputAmount(
          sourceChain,
          destinationChain,
          sourceToken,
          destinationToken,
          amount,
        )
        return output
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

  return {
    outputAmount: data,
    isLoading: isLoading || isFetching,
  }
}
