import type { Chain, Network, Token, TokenAmount } from '@velocitylabs-org/turtle-registry'
import { JsonRpcSigner } from 'ethers'
import { toHex } from 'viem'
import type { Sender } from '@/hooks/useTransfer'
import type { AmountInfo, StoredTransfer } from '@/models/transfer'
import { isSameChain } from '@/utils/routes'

type FormatLength = 'Short' | 'Long' | 'Longer'

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
 * @param length - Determines how many significant fraction digits will be shown for amount smaller than 1.
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
      return '~30 min to 1½ hours'
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
  ToArbitrum = 'ToArbitrum',
}

export const resolveDirection = (source: Chain, destination: Chain): Direction => {
  const src = source.network
  const dst = destination.network

  // Ethereum -> Polkadot
  if (src === 'Ethereum' && isAnyPolkadotNetwork(dst)) return Direction.ToPolkadot
  // Arbitrum -> Polkadot
  if (src === 'Arbitrum' && isAnyPolkadotNetwork(dst)) return Direction.ToPolkadot
  // Ethereum -> Ethereum
  if (src === 'Ethereum' && dst === 'Ethereum') return Direction.WithinEthereum
  // Polkadot -> Ethereum
  if (isAnyPolkadotNetwork(src) && dst === 'Ethereum') return Direction.ToEthereum
  // Polkadot -> Arbitrum
  if (isAnyPolkadotNetwork(src) && dst === 'Arbitrum') return Direction.ToArbitrum
  // XCM
  if (isAnyPolkadotNetwork(src) && isAnyPolkadotNetwork(dst)) return Direction.WithinPolkadot

  throw Error('The impossible happened')
}

function isAnyPolkadotNetwork(network: Network): boolean {
  return network === 'Polkadot' || network === 'Kusama'
}

export function toAmountInfo(tokenAmount?: TokenAmount | null, usdPrice?: number | null): AmountInfo | null {
  if (!tokenAmount || !tokenAmount.amount || !tokenAmount.token || !usdPrice) return null

  return {
    amount: tokenAmount.amount,
    token: tokenAmount.token,
    inDollars: tokenAmount.amount * usdPrice,
  }
}

export const txWasCancelled = (sender: Sender, error: unknown): boolean => {
  if (!(error instanceof Error)) return false

  if (sender instanceof JsonRpcSigner)
    return error.message.includes('ethers-user-denied') // Ethers connection
  else return error.message.includes('Cancelled') // Substrate connection
}

/**
 * Checks if an ongoing transfer is outdated and should be marked as undefined:
 * - XCM transfers are considered outdated after 30 mins.
 * - Bridge transfers are considered outdated after 6 hours.
 *
 * @param transfer - The ongoing transfer to check.
 * @returns A boolean indicating whether the transfer is outdated.
 */
export const startedTooLongAgo = (transfer: StoredTransfer, thresholdInHours = { xcm: 0.5, bridge: 6 }) => {
  const direction = resolveDirection(transfer.sourceChain, transfer.destChain)
  const timeBuffer =
    direction === Direction.WithinPolkadot
      ? thresholdInHours.xcm * 60 * 60 * 1000
      : thresholdInHours.bridge * 60 * 60 * 1000
  return Date.now() - new Date(transfer.date).getTime() > timeBuffer
}

type SwapProperties = {
  sourceToken?: Token
  destinationToken?: Token
  destinationAmount?: string
}

type SwapWithChains = SwapProperties & {
  sourceChain: Chain
  destChain: Chain
}

type CompleteSwap = SwapWithChains & Required<SwapProperties>

/**
 * Checks if a transfer is a swap (has destination token and amount)
 * @param transfer - The transfer to check
 * @returns if the transfer is a swap
 */
export const isSwap = <T extends SwapProperties>(transfer: T): transfer is T & Required<SwapProperties> => {
  return (
    !!transfer.destinationToken &&
    !!transfer.destinationAmount &&
    transfer.sourceToken?.id !== transfer.destinationToken?.id
  )
}

/**
 * Checks if a transfer is a swap within the same chain:
 *
 * @param transfer - The transfer to check.
 * @returns A boolean.
 */
export const isSameChainSwap = <T extends SwapWithChains>(transfer: T): transfer is T & CompleteSwap => {
  return isSwap(transfer) && isSameChain(transfer.sourceChain, transfer.destChain)
}

/**
 * Checks if a transfer is a swap + XCM between two different chains:
 *
 * @param transfer - The transfer to check.
 * @returns A boolean.
 */
export const isSwapWithTransfer = <T extends SwapWithChains>(transfer: T): transfer is T & CompleteSwap => {
  return isSwap(transfer) && !isSameChain(transfer.sourceChain, transfer.destChain)
}

export const hashToHex = (hash: string) => toHex(hash)
