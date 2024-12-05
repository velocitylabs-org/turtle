import { Token } from '@/models/token'
import { CACHE_REVALIDATE_IN_SECONDS, getCachedTokenPrice } from '@/services/balance'
import { captureException } from '@sentry/nextjs'
import { useQuery } from '@tanstack/react-query'

type TokenPriceResult = {
  price?: number
  loading: boolean
}

const useTokenPrice = (token?: Token | null): TokenPriceResult => {
  const {
    data: price,
    isLoading,
    error: isTokenPriceError,
  } = useQuery({
    queryKey: ['tokenPrice', token?.id],
    queryFn: async () => {
      if (!token) return null
      return await getCachedTokenPrice(token)
    },
    staleTime: CACHE_REVALIDATE_IN_SECONDS * 1000, // specified in miliseconds
  })

  if (isTokenPriceError) {
    console.error('useTokenPrice: Failed to fetch with error:', isTokenPriceError.message)
    captureException(isTokenPriceError.message)
    return { price: undefined, loading: false }
  }

  return { price: price?.usd, loading: isLoading }
}

export default useTokenPrice
