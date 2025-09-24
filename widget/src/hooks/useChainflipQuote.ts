import { captureException } from '@sentry/react'
import { useQuery } from '@tanstack/react-query'
import type { Chain, Token } from '@velocitylabs-org/turtle-registry'
import { useMemo } from 'react'
import { getChainflipQuote, isChainflipSwap } from '@/utils/chainflip'

export interface ChainflipQuoteParams {
  sourceChain?: Chain | null
  destinationChain?: Chain | null
  sourceToken?: Token | null
  destinationToken?: Token | null
  amount?: string | null
}

export const quoteQueryKey = (params: ChainflipQuoteParams) =>
  [
    'chainflip-quote',
    params.sourceChain?.uid,
    params.destinationChain?.uid,
    params.sourceToken?.id,
    params.destinationToken?.id,
    params.amount?.toString(),
  ] as const

export const canFetchQuote = (params: ChainflipQuoteParams) =>
  !!params.sourceChain &&
  !!params.destinationChain &&
  !!params.sourceToken &&
  !!params.destinationToken &&
  !!params.amount &&
  isChainflipSwap(params.sourceChain, params.destinationChain, params.sourceToken, params.destinationToken)

export async function getQuote(params: ChainflipQuoteParams) {
  if (!canFetchQuote(params)) return null
  const { sourceChain, destinationChain, sourceToken, destinationToken, amount } = params
  return getChainflipQuote(sourceChain!, destinationChain!, sourceToken!, destinationToken!, amount!)
}

export const useChainflipQuote = (params: ChainflipQuoteParams) => {
  const {
    data: chainflipQuote,
    isLoading: isLoadingChainflipQuote,
    isFetching: isFetchingChainflipQuote,
    isError: isChainflipQuoteError,
    error: chainflipQuoteError,
  } = useQuery({
    queryKey: quoteQueryKey(params),
    queryFn: async () => {
      try {
        return await getQuote(params)
      } catch (err) {
        captureException(err, { level: 'error', extra: { params } })
        throw err instanceof Error ? err : new Error(String(err))
      }
    },
    enabled: canFetchQuote(params),
    staleTime: 60_000, // Cache results for 1 min
    // refetchInterval: 60_000, // Refetch every 1 min
    retry: 2,
  })

  const isChainflip = useMemo(
    () => isChainflipSwap(params.sourceChain, params.destinationChain, params.sourceToken, params.destinationToken),
    [params.sourceChain, params.destinationChain, params.sourceToken, params.destinationToken],
  )

  return {
    isChainflipSwap: isChainflip,
    chainflipQuote,
    isLoadingChainflipQuote: isLoadingChainflipQuote || isFetchingChainflipQuote,
    isChainflipQuoteError,
    chainflipQuoteError,
  }
}
