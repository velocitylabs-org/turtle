import { useCallback, useEffect, useState } from 'react'
import { getCoingekoId, Token } from '@/models/token'
import { getTokenPrice } from '@/services/balance'
import { captureException } from '@sentry/nextjs'

const useTokenPrice = (token?: Token | null) => {
  const [price, setPrice] = useState<number | null>(null)

  const fetchPrice = useCallback(async () => {
    if (!token) {
      setPrice(null)
      return
    }

    try {
      const result = await getTokenPrice(getCoingekoId(token))
      const price = result?.usd ?? 0
      setPrice(price)
    } catch (e) {
      console.error('useTokenPrice: Failed to fetch with error:', e)
      captureException(e)
    }
  }, [token])

  useEffect(() => {
    fetchPrice()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return price
}

export default useTokenPrice