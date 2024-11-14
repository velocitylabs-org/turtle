import { useCallback, useEffect, useState } from 'react'

import { getCoingekoId, Token } from '@/models/token'
import { getTokenPrice } from '@/services/balance'

const useTokenPrice = (token?: Token | null) => {
  const [price, setPrice] = useState<number | null>(null)

  const fetchPrice = useCallback(async () => {
    if (!token) {
      setPrice(null)
      return
    }

    try {
      const price = (await getTokenPrice(getCoingekoId(token)))?.usd ?? 0
      setPrice(price)
    } catch (e) {
      // Do not throw an error here
      console.error('useTokenPrice: Failed to fetch with error:', e)
    }
  }, [token])

  useEffect(() => {
    fetchPrice()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return price
}

export default useTokenPrice
