import { Token } from '@/models/token'
import { getApiTokenPrice } from '@/services/balance'
import { captureException } from '@sentry/nextjs'
import { useQuery } from '@tanstack/react-query'

const useTokenPrice = (token?: Token | null) => {
  const { data: price, error: isTokenPriceError } = useQuery({
    queryKey: ['tokenPrice', token?.id],
    queryFn: async () => {
      if (!token) return null
      return await getApiTokenPrice(token)
    },
    staleTime: 1000 * 60 * 3, // stale data for 3 mins
  })

  if (isTokenPriceError) {
    console.error('useTokenPrice: Failed to fetch with error:', isTokenPriceError.message)
    captureException(isTokenPriceError.message)
    return null
  }

  if (!price) return null
  return price
}

export default useTokenPrice
