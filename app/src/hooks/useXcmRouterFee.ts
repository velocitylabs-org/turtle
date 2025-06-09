import { captureException } from '@sentry/nextjs'
import { useQuery } from '@tanstack/react-query'
import { Chain, Token, isSameToken } from '@velocitylabs-org/turtle-registry'
import { useMemo } from 'react'
import { AmountInfo } from '@/models/transfer'
import { Dex, getXcmRouterFee, getExchangeOutputAmount } from '@/utils/paraspellSwap'
import { getPlaceholderAddress } from '@/utils/address'

interface UseXcmRouterFeeParams {
  sourceChain: Chain
  destinationChain: Chain
  sourceToken: Token
  destinationToken: Token
  exchange: Dex | [Dex, Dex, ...Dex[]]
  /** Fee is usually not strongly dependent on the amount. It will default to 10^decimals of the source token. */
  amount?: string
  /** Fee is usually independent of the addresses. Recommened not to pass this. It will default to the placeholder address. */
  sender?: string
  /** Fee is usually independent of the addresses. Recommened not to pass this. It will default to the placeholder address. */
  recipient?: string
  slippagePct?: string
}

interface XcmRouterFee {}

export function useXcmRouterFee({
  sourceChain,
  destinationChain,
  sourceToken,
  destinationToken,
  exchange = 'HydrationDex',
  amount = BigInt(10 ** sourceToken.decimals).toString(), // placeholder amount
  sender,
  recipient,
  slippagePct = '1',
}: UseXcmRouterFeeParams): XcmRouterFee {
  const { data, isLoading, isFetching } = useQuery({
    // Excluded sender and recipient as it definitely does not impact the fee
    queryKey: [
      'xcmRouterFee',
      sourceChain.uid,
      destinationChain.uid,
      sourceToken.id,
      destinationToken.id,
      exchange,
      amount,
      slippagePct,
    ],
    queryFn: async () => {
      try {
        const fee = await getXcmRouterFee({
          sourceChain,
          destinationChain,
          sourceToken,
          destinationToken,
          exchange,
          amount,
          sender: sender ?? getPlaceholderAddress(sourceChain.supportedAddressTypes[0]),
          recipient: recipient ?? getPlaceholderAddress(destinationChain.supportedAddressTypes[0]),
          slippagePct,
        })
        return fee
      } catch (error) {
        captureException(error, {
          level: 'error',
          extra: {
            sourceChain,
            destinationChain,
            sourceToken,
            destinationToken,
            amount,
            exchange,
            sender,
            recipient,
            slippagePct,
          },
        })
        console.error('Failed to fetch xcm router fee:', error)
        return
      }
    },
    enabled: !!sourceChain && !!destinationChain && !!sourceToken && !!destinationToken,
    staleTime: 10000, // Cache 10 seconds
    retry: 2,
  })

  return useMemo(
    () => ({
      xcmRouterFee: data,
      isLoading: isLoading || isFetching,
    }),
    [data, isLoading, isFetching],
  )
}
