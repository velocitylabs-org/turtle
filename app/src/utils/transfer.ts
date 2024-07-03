import { Network } from '@/models/chain'
import { Token } from '@/models/token'
import { Fees } from '@/models/transfer'
import { ethers } from 'ethers'

/**
 * Converts a user-specified amount to its corresponding value in the token's decimal base.
 *
 * For example, if the input is "1 WETH" and given that WETH is an 18 decimals token, the function converts this to 1 * 10^18 = 1000000000000000000 (wei).
 *
 * @param input - The amount specified by the user. For example, 1 WETH.
 * @param token - The token object which includes its decimals property.
 * @returns The amount in with the token's decimal base, or null if the input or token is not provided.
 */
export const convertAmount = (input: number | null, token: Token | null): bigint | null => {
  if (input == null || !token) return null

  return BigInt(input * 10 ** token.decimals)
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
export const toHuman = (input: bigint | string, token: Token): number => {
  return Number(input) / 10 ** token.decimals
}

export const formatDate = (date: string | Date): string => {
  const dateFrom = typeof date == 'string' ? new Date(date) : date
  return dateFrom.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  })
}

export function feeToHuman(fees: Fees): string {
  return toHuman(fees.amount, fees.token).toFixed(10)
}

export async function lookupName(network: Network, address: string): Promise<string | null> {
  switch (network) {
    case Network.Ethereum: {
      const provider = new ethers.CloudflareProvider()
      try {
        return provider.lookupAddress(address)
      } catch {
        // we are happy to fail silently here for now
        return null
      }
    }
    case Network.Polkadot: {
      //todo(nuno)
      return null
    }
  }
}
