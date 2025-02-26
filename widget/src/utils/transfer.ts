import { ethers } from 'ethers'
import { Chain, Network } from '@/models/chain'
import { Token } from '@/models/token'
import { TokenAmount } from '@/models/select'
import { AmountInfo } from '@/models/transfer'

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
 * Safe version of `convertAmount` that handles `null` and `undefined` params
 */
export const safeConvertAmount = (input?: number | null, token?: Token | null): bigint | null => {
  if (input == null || !token) return null

  return BigInt(Math.floor(input * 10 ** token.decimals))
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

export function getDurationEstimate(direction: Direction): string {
  switch (direction) {
    case Direction.ToEthereum:
      return '~30 min to 1.5 hours'
    case Direction.ToPolkadot:
      return '~30 min'
    // NOTE: We don't support these now but we are leaving a reasonable estimate anyways
    // which is both safe and keeps us from needing to cascade a type-safe setup for these
    // use cases in the meantime.
    case Direction.WithinPolkadot:
      return '~45 seconds'
    case Direction.WithinEthereum:
      return '~5 min'

    // Should never happen
    default:
      return 'N/A'
  }
}

/**
 * The direction of a transfer, i.e, from and to which network the tokens
 * will be sent.
 *
 */
export enum Direction {
  ToEthereum = 'ToEthereum',
  ToPolkadot = 'toPolkadot',
  WithinPolkadot = 'WithinPolkadot',
  WithinEthereum = 'WithinEthereum',
}

/**
 * Resolve the direction of a transfer given the source and destination chains.
 */
export const resolveDirection = (source: Chain, destination: Chain): Direction => {
  if (source.network == 'Ethereum' && destination.network == 'Polkadot') return Direction.ToPolkadot
  if (source.network == 'Polkadot' && destination.network == 'Ethereum') return Direction.ToEthereum
  if (source.network == 'Ethereum' && destination.network == 'Ethereum')
    return Direction.WithinEthereum
  if (source.network == 'Polkadot' && destination.network == 'Polkadot')
    return Direction.WithinPolkadot

  throw Error('The impossible happened')
}

export function toAmountInfo(
  tokenAmount?: TokenAmount | null,
  usdPrice?: number | null,
): AmountInfo | null {
  if (!tokenAmount || !tokenAmount.amount || !tokenAmount.token || !usdPrice) return null

  return {
    amount: tokenAmount.amount,
    token: tokenAmount.token,
    inDollars: tokenAmount.amount * usdPrice,
  }
}

export const getTotalFees = (fees: AmountInfo, additionalfees?: AmountInfo | null) => {
  const additionalAmount = additionalfees ? Number(additionalfees.amount) : 0
  const additionalValue = additionalfees?.inDollars || 0
  const totalFeesAmount = formatAmount(toHuman(fees.amount, fees.token) + additionalAmount)
  const totalFeesValue = formatAmount(fees.inDollars + additionalValue)

  return { totalFeesAmount, totalFeesValue }
}
