import { Token, TokenPrice } from '@velocitylabs-org/turtle-registry'

export const CACHE_REVALIDATE_IN_SECONDS = 180

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
