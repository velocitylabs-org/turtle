import { captureException } from '@sentry/nextjs'
import { useQuery } from '@tanstack/react-query'
import type { Chain, Token } from '@velocitylabs-org/turtle-registry'
import { getChainflipQuote, isChainflipSwap } from '@/utils/chainflip'

export interface ChainflipQuoteParams {
  sourceChain?: Chain | null
  destinationChain?: Chain | null
  sourceToken?: Token | null
  destinationToken?: Token | null
  amount?: string | null
}

export const quoteQueryKey = (p: ChainflipQuoteParams) =>
  [
    'chainflip-quote',
    p.sourceChain?.uid,
    p.destinationChain?.uid,
    p.sourceToken?.id,
    p.destinationToken?.id,
    p.amount?.toString(),
  ] as const

export const canFetchQuote = (p: ChainflipQuoteParams) =>
  !!p.sourceChain &&
  !!p.destinationChain &&
  !!p.sourceToken &&
  !!p.destinationToken &&
  !!p.amount &&
  isChainflipSwap(p.sourceChain, p.destinationChain, p.sourceToken, p.destinationToken)

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

  return {
    chainflipQuote,
    isLoadingChainflipQuote: isLoadingChainflipQuote || isFetchingChainflipQuote,
    isChainflipQuoteError,
    chainflipQuoteError,
  }
}
