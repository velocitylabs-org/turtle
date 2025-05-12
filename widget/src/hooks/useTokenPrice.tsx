import { useQuery } from '@tanstack/react-query'
import { TokenPriceResult } from '@/models/balance'
import { Token } from '@/models/token'
import { CACHE_REVALIDATE_IN_SECONDS } from '@/utils/consts'
import { getTokenPrice } from '@/utils/token'

const useTokenPrice = (token?: Token | null): TokenPriceResult => {
  const {
    data: price,
    isLoading,
    error: isTokenPriceError,
  } = useQuery({
    queryKey: ['tokenPrice', token?.id],
    queryFn: async () => {
      if (!token) return null
      return await getTokenPrice(token)
    },
    staleTime: CACHE_REVALIDATE_IN_SECONDS * 1000, // specified in miliseconds
  })

  if (isTokenPriceError) {
    console.error('useTokenPrice: Failed to fetch with error:', isTokenPriceError.message)
    // captureException(isTokenPriceError.message) - Sentry
    return { price: undefined, loading: false }
  }

  return { price: price?.usd, loading: isLoading }
}

export default useTokenPrice
