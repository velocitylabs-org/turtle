import { Token } from '@/models/token'

export const CACHE_REVALIDATE_IN_SECONDS = 180

export interface TokenPrice {
  usd: number
}

export interface Erc20Balance {
  value: bigint
  decimals: number
  symbol: string
  formatted: string
}

export const getTokenPrice = async (tokenId: string): Promise<TokenPrice | null> => {
  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId.toLocaleLowerCase()}&vs_currencies=usd`
    const options = { method: 'GET', headers: { accept: 'application/json' } }
    const result = await fetch(url, options)

    if (!result.ok) throw new Error(`Failed to fetch ${tokenId} price from coingecko`)

    return (await result.json())[tokenId.toLocaleLowerCase()] as TokenPrice
  } catch (error) {
    console.log('getTokenPrice error:', error)
    return null
  }
}

/**
 * Fetches and caches the price of a token from the server.
 * It serves as a cached layer for retrieving token prices by relying on the `getTokenPrice` function.
 *
 * @param token - The token to fetch its price.
 * @returns - A Promise resolving to the token price as a number.
 */
export const getCachedTokenPrice = async (token: Token): Promise<TokenPrice> => {
  const response = await fetch(`/api/token-price`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  })

  if (!response.ok) {
    const { error } = await response.json()
    throw new Error(error || `Failed to fetch ${token.id} price from server request`)
  }
  return await response.json()
}
