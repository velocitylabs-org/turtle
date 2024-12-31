import { getEnvironment } from '@/context/snowbridge'
import { Sender } from '@/hooks/useTransfer'
import { Network, Chain } from '@/models/chain'
import { TokenAmount } from '@/models/select'
import { Token } from '@/models/token'
import {
  AmountInfo,
  CompletedTransfer,
  OngoingTransferWithDirection,
  StoredTransfer,
  TransfersByDate,
} from '@/models/transfer'
import { Direction, resolveDirection } from '@/services/transfer'
import { Environment } from '@/store/environmentStore'
import { ethers, JsonRpcSigner } from 'ethers'
import { AssetHub, RelayChain } from '@/registry/mainnet/chains'

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

export const removeURLSlash = (url: string) => {
  if (url.length === 0) return url
  const lastChar = url.charAt(url.length - 1)
  if (lastChar === '/') {
    return url.slice(0, -1)
  } else {
    return url
  }
}

const EXPLORERS: { [environment in Environment]: { [explorerName: string]: string } } = {
  [Environment.Testnet]: {
    etherscan: 'https://sepolia.etherscan.io/',
    subscan_assethub: 'https://assethub-rococo.subscan.io/',
    subscan_brigehub: 'https://bridgehub-rococo.subscan.io/',
    subscan_relaychain: 'https://rococo.subscan.io/',
  },
  [Environment.Mainnet]: {
    etherscan: 'https://etherscan.io/',
    subscan_assethub: 'https://assethub-polkadot.subscan.io/',
    subscan_brigehub: 'https://bridgehub-polkadot.subscan.io/',
    subscan_relaychain: 'https://polkadot.subscan.io/',
  },
}

export function getExplorerLink(transfer: StoredTransfer): string | undefined {
  const {
    environment,
    sourceChain: { network, chainId, walletType, name },
    sendResult: result,
    sender,
    id,
    uniqueTrackingId,
  } = transfer
  const explorersUrls = EXPLORERS[environment]
  switch (network) {
    case 'Ethereum': {
      if (result?.success?.ethereum && 'transactionHash' in result.success.ethereum)
        return `${removeURLSlash(explorersUrls.etherscan)}/tx/${result.success.ethereum.transactionHash}`

      // Default Ethereum network explorer link:
      return `${removeURLSlash(explorersUrls.etherscan)}/address/${sender}`
    }
    case 'Polkadot': {
      const txHash =
        result?.success?.assetHub && 'txHash' in result.success.assetHub
          ? result.success.assetHub.txHash
          : undefined
      if (txHash) return `${removeURLSlash(explorersUrls.subscan_assethub)}/extrinsic/${txHash}`

      if (uniqueTrackingId) {
        const path = getSubdomainPath(explorersUrls.subscan_relaychain)
        return `${removeURLSlash(explorersUrls.subscan_relaychain)}/xcm_message/${path}-${uniqueTrackingId}`
      }

      if (walletType === 'SubstrateEVM') {
        return getCustomExplorerLink(name, sender)
      }

      const env = getEnvironment(environment)
      if (chainId === env.config.ASSET_HUB_PARAID)
        return `${removeURLSlash(explorersUrls.subscan_assethub)}/extrinsic/${id}`

      // Default Polkadot network explorer link:
      return `${removeURLSlash(explorersUrls.subscan_relaychain)}/account/${sender}?tab=xcm_transfer`
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
export const getSubdomainPath = (url: string) => {
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
export const getCustomExplorerLink = (name: string, sender: string) => {
  return `https://${name.toLowerCase()}.subscan.io/account/${sender}?tab=xcm_transfer`
}

export const txWasCancelled = (sender: Sender, error: unknown): boolean => {
  if (!(error instanceof Error)) return false

  if (sender instanceof JsonRpcSigner)
    return error.message.includes('ethers-user-denied') // Ethers connection
  else return error.message.includes('Cancelled') // Substrate connection
}

//todo(team): query the right sdk to get the appropriate duration estimate
export function getDurationEstimate(direction: Direction): string {
  switch (direction) {
    case Direction.ToEthereum:
      return '~30 min to 4 hours'
    case Direction.ToPolkadot:
      return '~30 min'
    // NOTE: We don't support these now but we are leaving a reasonable estimate anyways
    // which is both safe and keeps us from needing to cascade a type-safe setup for these
    // use cases in the meantime.
    case Direction.WithinPolkadot:
      return '~30-45s'
    case Direction.WithinEthereum:
      return '~5 min'

    // Should never happen
    default:
      return 'N/A'
  }
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

/**
 * Orders completed transfers by date.
 * @param transfers - The list of completed transfers to order.
 * @returns The list of completed transfers ordered by date.
 */
export const orderTransfersByDate = (transfers: CompletedTransfer[]) =>
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
export const startedTooLongAgo = (
  transfer: StoredTransfer,
  thresholdInHours = { xcm: 0.5, bridge: 6 },
) => {
  const direction = resolveDirection(transfer.sourceChain, transfer.destChain)
  const timeBuffer =
    direction === Direction.WithinPolkadot
      ? thresholdInHours.xcm * 60 * 60 * 1000
      : thresholdInHours.bridge * 60 * 60 * 1000
  return new Date().getTime() - new Date(transfer.date).getTime() > timeBuffer
}

/**
 * Checks if a chain is not a system chain (Asset Hub or Relaychain) but a parachain.
 *
 * @param chain - The chain to check.
 * @returns A boolean indicating whether the chain is a system chain (Asset Hub or Relaychain) or a parachain.
 */
export const isParachain = (chain: Chain): boolean =>
  chain.chainId !== AssetHub.chainId && chain.chainId !== RelayChain.chainId

/**
 * Checks if a both the source chain and the destination chain of a transfer are parachains
 *
 * @param transfer - The ongoing transfer to check.
 * @returns A boolean indicating whether the transfers source and destination are parachains.
 */
export const parachainsOnly = (
  transfer: StoredTransfer | OngoingTransferWithDirection,
): boolean => {
  const { sourceChain, destChain } = transfer
  return isParachain(sourceChain) && isParachain(destChain)
}
