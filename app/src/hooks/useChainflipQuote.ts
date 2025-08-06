import { captureException } from '@sentry/nextjs'
import { useQuery } from '@tanstack/react-query'
import { Token, Chain } from '@velocitylabs-org/turtle-registry'
import { getChainflipQuote, isChainflipSwap } from '@/utils/chainflip'

interface UseChainflipQuoteParams {
  sourceChain?: Chain | null
  destinationChain?: Chain | null
  sourceToken?: Token | null
  destinationToken?: Token | null
  amount?: string | null
}

export const useChainflipQuote = ({
  sourceChain,
  destinationChain,
  sourceToken,
  destinationToken,
  amount,
}: UseChainflipQuoteParams) => {
  const {
    data: chainflipQuote,
    isLoading: isLoadingChainflipQuote,
    isFetching: isFetchingChainflipQuote,
    isError: isErrorChainflipQuote,
    error: errorChainflipQuote,
  } = useQuery({
    queryKey: [
      'chainflip-quote',
      sourceChain,
      destinationChain,
      sourceToken,
      destinationToken,
      amount,
    ],
    queryFn: async () => {
      if (!sourceChain || !destinationChain || !sourceToken || !destinationToken || !amount)
        return null
      try {
        return await getChainflipQuote(
          sourceChain,
          destinationChain,
          sourceToken,
          destinationToken,
          amount,
        )
      } catch (error) {
        captureException(error, {
          level: 'error',
          extra: { sourceChain, destinationChain, sourceToken, destinationToken, amount },
        })
        console.error('Failed to get Chainflip quote:', error)
        return null
      }
    },
    enabled:
      !!sourceChain &&
      !!destinationChain &&
      !!sourceToken &&
      !!destinationToken &&
      !!amount &&
      isChainflipSwap(sourceChain, destinationChain, sourceToken, destinationToken),
    staleTime: 30000, // Cache results for 30 seconds
    retry: 2, // Retry failed requests twice
  })

  return {
    chainflipQuote,
    isLoadingChainflipQuote,
    isFetchingChainflipQuote,
    isErrorChainflipQuote,
    errorChainflipQuote,
  }
}
