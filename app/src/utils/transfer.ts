import { AssetHub, type Chain, KusamaAssetHub, type Token, type TokenAmount } from '@velocitylabs-org/turtle-registry'
import { JsonRpcSigner } from 'ethers'
import type { Sender } from '@/hooks/useTransfer'
import type { AmountInfo, CompletedTransfer, StoredTransfer, TransfersByDate } from '@/models/transfer'
import { Direction, resolveDirection } from '@/services/transfer'
import { isChainflipSwap } from './chainflip'
import { isSameChain } from './routes'

/**
 * Safe version of `convertAmount` that handles `null` and `undefined` params
 */
export const safeConvertAmount = (input?: number | null, token?: Token | null): bigint | null => {
  if (input == null || Number.isNaN(input) || !Number.isFinite(input) || !token || !Number.isInteger(token.decimals))
    return null

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

export function feeToHuman(fees: AmountInfo): string {
  return toHuman(fees.amount, fees.token).toFixed(10)
}

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

const removeURLSlash = (url: string) => {
  if (url.length === 0) return url
  const lastChar = url.charAt(url.length - 1)
  if (lastChar === '/') {
    return url.slice(0, -1)
  } else {
    return url
  }
}

const EXPLORERS = {
  // Ethereum
  etherscan: 'https://etherscan.io/',

  // Polkadot
  subscan_polkadot: 'https://polkadot.subscan.io/',
  subscan_polkadot_ah: 'https://assethub-polkadot.subscan.io/',
  subscan_polkadot_bh: 'https://bridgehub-polkadot.subscan.io/',

  // Kusama
  subscan_kusama: 'https://kusama.subscan.io/',
  subscan_kusama_ah: 'https://assethub-kusama.subscan.io/',
  subscan_kusama_bh: 'https://bridgehub-kusama.subscan.io/',

  // Chainflip
  chainflip: 'https://scan.chainflip.io/',
}

export const getChainflipExplorerLink = (swap: StoredTransfer, chainflipSwapId?: string): string | undefined => {
  if (chainflipSwapId) return `${removeURLSlash(EXPLORERS.chainflip)}/swaps/${chainflipSwapId}`
  if (swap.uniqueTrackingId) return `${removeURLSlash(EXPLORERS.chainflip)}/channels/${swap.uniqueTrackingId}`
}

export function getExplorerLink(transfer: StoredTransfer): string | undefined {
  const {
    sourceChain: { network, chainId, walletType, name },
    destChain,
    sendResult: txHash,
    sourceToken,
    destinationToken,
    sender,
    id,
    uniqueTrackingId,
  } = transfer

  // Chainflip explorer link - Not relying on network
  const isChainflip = isChainflipSwap(transfer.sourceChain, destChain, sourceToken, destinationToken)
  if (isChainflip) return getChainflipExplorerLink(transfer)

  switch (network) {
    case 'Ethereum': {
      if (txHash) return `${removeURLSlash(EXPLORERS.etherscan)}/tx/${txHash}`

      // Default Ethereum network explorer link:
      return `${removeURLSlash(EXPLORERS.etherscan)}/address/${sender}`
    }
    case 'Polkadot': {
      if (txHash) return `${removeURLSlash(EXPLORERS.subscan_polkadot_ah)}/extrinsic/${txHash}`

      if (uniqueTrackingId) {
        const path = getSubdomainPath(EXPLORERS.subscan_polkadot)
        return `${removeURLSlash(EXPLORERS.subscan_polkadot)}/xcm_message/${path}-${uniqueTrackingId}`
      }

      if (walletType === 'SubstrateEVM') {
        return getCustomExplorerLink(name, sender)
      }

      if (chainId === AssetHub.chainId) return `${removeURLSlash(EXPLORERS.subscan_polkadot_ah)}/extrinsic/${id}`

      // Default Polkadot network explorer link:
      return `${removeURLSlash(EXPLORERS.subscan_polkadot)}/account/${sender}?tab=xcm_transfer`
    }
    case 'Kusama': {
      if (txHash) return `${removeURLSlash(EXPLORERS.subscan_kusama_ah)}/extrinsic/${txHash}`

      if (uniqueTrackingId) {
        const path = getSubdomainPath(EXPLORERS.subscan_kusama)
        return `${removeURLSlash(EXPLORERS.subscan_kusama)}/xcm_message/${path}-${uniqueTrackingId}`
      }

      if (walletType === 'SubstrateEVM') {
        return getCustomExplorerLink(name, sender)
      }

      if (chainId === KusamaAssetHub.chainId) return `${removeURLSlash(EXPLORERS.subscan_kusama_ah)}/extrinsic/${id}`

      // Default Polkadot network explorer link:
      return `${removeURLSlash(EXPLORERS.subscan_kusama)}/account/${sender}?tab=xcm_transfer`
    }
    default:
      console.log(`Unsupported network: ${network}`)
  }
}

/**
 * Extracts and returns the subdomain from a given URL.
 * For example,'https://polkadot.subscan.io/' input, returns 'polkadot'.
 * @param url - The URL from which the subdomain needs to be extracted. For example, "https://sub.example.com".
 * @returns The subdomain string from the URL.
 */
const getSubdomainPath = (url: string) => {
  // Generate a constructor URL. Example: 'https://polkadot.subscan.io/'
  const parsedUrl = new URL(url)
  // Filter hostname from URL: 'polkadot.subscan.io/'
  const hostname = parsedUrl.hostname
  // Split hostname & extract subdomain path: 'polkadot'
  return hostname.split('.')[0]
}

/**
 * Generates the explorer link for SubstrateEVM walletType based chains. ex: Moonbmean, Mythos
 * @param name - The chain name.
 * @param sender - The sender address.
 * @returns The Subscan explorer link
 */
const getCustomExplorerLink = (name: string, sender: string) => {
  return `https://${name.toLowerCase()}.subscan.io/account/${sender}?tab=xcm_transfer`
}

export const txWasCancelled = (sender: Sender, error: unknown): boolean => {
  if (!(error instanceof Error)) return false

  if (sender instanceof JsonRpcSigner)
    return error.message.includes('ethers-user-denied') || error.message.includes('User rejected the request') // Ethers/Viem.js connection
  else return error.message.includes('Cancelled') // Substrate connection
}

//todo(team): query the right sdk to get the appropriate duration estimate
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

export function toAmountInfo(tokenAmount?: TokenAmount | null, usdPrice?: number | null): AmountInfo | null {
  if (!tokenAmount || !tokenAmount.amount || !tokenAmount.token || !usdPrice) return null

  return {
    amount: tokenAmount.amount,
    token: tokenAmount.token,
    inDollars: tokenAmount.amount * usdPrice,
  }
}

/**
 * Orders completed transfers by date.
 * @param transfers - The list of completed transfers to order.
 * @returns The list of completed transfers ordered by date.
 */
const orderTransfersByDate = (transfers: CompletedTransfer[]) =>
  transfers.reduce<TransfersByDate>((acc, transfer) => {
    let date: string
    if (typeof transfer.date === 'string') {
      date = new Date(transfer.date).toISOString().split('T')[0]
    } else if (transfer.date instanceof Date) {
      date = transfer.date.toISOString().split('T')[0]
    } else {
      date = 'Unknown date'
    }

    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(transfer)
    return acc
  }, {})

/**
 * Formats the ordered completed transfers list to match the transfer history design.
 * @param transfers - The list of completed transfers to format.
 * @returns The formatted list of completed transfers.
 */
export const formatTransfersByDate = (transfers: CompletedTransfer[]) => {
  const orderedTransfersByDate = orderTransfersByDate(transfers)
  return Object.keys(orderedTransfersByDate)
    .map(date => {
      return { date, transfers: orderedTransfersByDate[date] }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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
