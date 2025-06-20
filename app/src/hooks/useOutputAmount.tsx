import { captureException } from '@sentry/nextjs'
import { useQuery } from '@tanstack/react-query'
import { Chain, Token, isSameToken } from '@velocitylabs-org/turtle-registry'
import { useMemo } from 'react'
import { AmountInfo } from '@/models/transfer'
import { getExchangeOutputAmount } from '@/utils/paraspellSwap'

interface UseOutputAmountParams {
  sourceChain?: Chain | null
  destinationChain?: Chain | null
  sourceToken?: Token | null
  destinationToken?: Token | null
  /** Amount in the source token's decimal base */
  amount?: string | null
  /** Fees are used to calculate the output amount for transfers */
  fees?: Pick<AmountInfo, 'amount' | 'token'> | null
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
        if (!isSameToken(sourceToken, destinationToken)) {
          // Swap
          const output = await getExchangeOutputAmount(
            sourceChain,
            destinationChain,
            sourceToken,
            destinationToken,
            amount,
          )
          return output
        }

        // Normal transfer
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
