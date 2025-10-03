import type { Token, TokenPrice } from '@velocitylabs-org/turtle-registry'
import { getTokenPrice } from '@velocitylabs-org/turtle-registry'
import { CACHE_REVALIDATE_IN_SECONDS } from '@/utils/consts.ts'

interface CacheEntry {
  data: TokenPrice
  timestamp: number
}

const CACHE_NAME = 'token-price-cache-v1'

/**
 * Fetches and caches the price of a token using the Cache API.
 * It serves as a cached layer for retrieving token prices by relying on the `getTokenPrice` function.
 *
 * @param token - The token to fetch its price.
 * @returns - A Promise resolving to the token price as a number.
 */
export const getCachedTokenPrice = async (token: Token): Promise<TokenPrice | null> => {
  const cacheKey = `tokenPrice-${token.id}`
  const now = Date.now()

  try {
    const cache = await caches.open(CACHE_NAME)
    const cachedResponse = await cache.match(cacheKey)
    if (cachedResponse) {
      const cacheEntry: CacheEntry = await cachedResponse.json()
      const cacheAge = (now - cacheEntry.timestamp) / 1000 // in seconds

      if (cacheAge < CACHE_REVALIDATE_IN_SECONDS) {
        return cacheEntry.data
      }
    }

    // Cache miss or stale, fetch fresh data
    const tokenPrice = await getTokenPrice(token)

    if (tokenPrice) {
      const cacheEntry: CacheEntry = {
        data: tokenPrice,
        timestamp: now,
      }

      const response = new Response(JSON.stringify(cacheEntry), {
        headers: { 'Content-Type': 'application/json' },
      })

      await cache.put(cacheKey, response)
    }

    return tokenPrice
  } catch {
    // Fallback if Cache API is not available
    return await getTokenPrice(token)
  }
}
