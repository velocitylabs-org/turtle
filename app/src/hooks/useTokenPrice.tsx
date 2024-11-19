import { getCoingekoId, Token } from '@/models/token'
import { getTokenPrice } from '@/services/balance'
import { captureException } from '@sentry/nextjs'
import { useCallback, useEffect, useState } from 'react'

const useTokenPrice = (token?: Token | null) => {
  const [price, setPrice] = useState<number | null>(null)

  const fetchPrice = useCallback(async () => {
    if (!token) {
      setPrice(null)
      return
    }

    try {
      console.log('fetchPrice')
      const result = await getTokenPrice(getCoingekoId(token))
      const price = result?.usd ?? 0
      setPrice(price)
    } catch (e) {
      console.error('useTokenPrice: Failed to fetch with error:', e)
      captureException(e)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token?.id])

  useEffect(() => {
    fetchPrice()
  }, [fetchPrice])

  return price
}

export default useTokenPrice
