import { Token } from '@/models/token'
import { captureException } from '@sentry/nextjs'
import { useQuery } from '@tanstack/react-query'

const fetchTokenPrice = async (token: Token) => {
  const response = await fetch(`/api/tokenPrice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  })

  if (!response.ok) {
    const { error } = await response.json()
    throw new Error(error || 'Failed to fetch token price')
  }
  const data: number = await response.json()
  return data
}

const useTokenPrice = (token?: Token | null) => {
  const { data: price, error: isTokenPriceError } = useQuery({
    queryKey: ['tokenPrice', token?.id],
    queryFn: async () => {
      if (!token) return null
      return await fetchTokenPrice(token)
    },
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
