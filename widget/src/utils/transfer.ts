import { ethers } from 'ethers'
import { Network } from '@/models/chain'
import { Token } from '@/models/token'

export type FormatLength = 'Short' | 'Long' | 'Longer'

function getMaxSignificantDigits(length: FormatLength): number {
  switch (length) {
    case 'Short':
      return 2
    case 'Long':
      return 6
    case 'Longer':
      return 10
  }
}

/**
 * Formats a numerical amount into a human-readable, compact string representation.
 * @param amount - The amount to be formatted. For example, `1234567`.
 * @param length - Determines how many significant fraction digits will be shown for amount < 1.
 * @returns The amount formatted as a human-readable string. For example, `"1.23M"`.
 */
export const formatAmount = (amount: number, length: FormatLength = 'Short'): string => {
  if (amount < 1) {
    return new Intl.NumberFormat('en-US', {
      maximumSignificantDigits: getMaxSignificantDigits(length),
      roundingMode: 'floor',
    }).format(amount)
  } else {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short',
      roundingMode: 'floor',
      maximumFractionDigits: 3,
    }).format(amount)
  }
}

export async function lookupName(network: Network, address: string): Promise<string | null> {
  switch (network) {
    case 'Ethereum': {
      try {
        const provider = new ethers.CloudflareProvider()
        return await provider.lookupAddress(address)
      } catch (error) {
        // Do not throw an error here
        console.log(error)
        return null
      }
    }
    case 'Polkadot': {
      //todo(nuno)
      return null
    }
  }
}

/**
 * Converts a low-level amount in its corresponding value in the token's decimal base to the human readable representation.
 *
 * For example, if the input is "3000000000000000000" (wETH) and given that WETH is an 18 decimals token, the function converts it to "3".
 *
 * @param input - The amount specified by the user. For example, 3000000000000000000" (wETH).
 * @param token - The token object which includes its decimals property.
 * @returns The amount readable by humans
 */
export const toHuman = (input: bigint | string | number, token: Token): number => {
  return Number(input) / 10 ** token.decimals
}

/**
 * Converts a user-specified amount to its corresponding value in the token's decimal base.
 *
 * For example, if the input is "1 WETH" and given that WETH is an 18 decimals token, the function converts this to 1 * 10^18 = 1000000000000000000 (wei).
 *
 * @param input - The amount specified by the user. For example, 1 WETH.
 * @param token - The token object which includes its decimals property.
 * @returns The amount in with the token's decimal base, or null if the input or token is not provided.
 */
export const convertAmount = (input: number, token: Token): bigint => {
  return BigInt(input * 10 ** token.decimals)
}
