import { Token } from '@/models/token'
import { CACHE_REVALIDATE_IN_SECONDS, getCachedTokenPrice } from '@/services/balance'
import { captureException } from '@sentry/nextjs'
import { useQuery } from '@tanstack/react-query'

type TokenPriceRes = {
  price: number
  isTokenPriceLoading: false
} | null

const useTokenPrice = (token?: Token | null): TokenPriceRes => {
  const {
    data: price,
    isLoading: isTokenPriceLoading,
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
    return null
  }

  if (!price) return null
  return { price: price.usd ?? 0, isTokenPriceLoading }
}

export default useTokenPrice
