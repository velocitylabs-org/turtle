import { Token } from '@/models/token'

/**
 * Convert a user given amount to the correct value that takes the token decimal in consideration
 *
 * E.g 1 WETH as input is converted to 1000000000000000000 given that WETH is an 18-decimal token.
 *
 * @param input - the input amount
 * @param token - the token the amount is relative to
 * @returns the amount in the decimal base of the given token
 */
export const convertAmount = (input: number | null, token: Token | null): number | null => {
  if (!input || !token) return null

  return input * 10 ** token.decimals
}
