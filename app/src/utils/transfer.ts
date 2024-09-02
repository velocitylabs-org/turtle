import { Sender } from '@/hooks/useTransfer'
import { Network } from '@/models/chain'
import { Token } from '@/models/token'
import { Fees, StoredTransfer } from '@/models/transfer'
import { Direction } from '@/services/transfer'
import { Environment } from '@/store/environmentStore'
import { ethers, JsonRpcSigner } from 'ethers'

/**
 * Safe version of `convertAmount` that handles `null` params
 */
export const safeConvertAmount = (input: number | null, token: Token | null): bigint | null => {
  if (input == null || !token) return null

  return BigInt(input * 10 ** token.decimals)
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
export const toHuman = (input: bigint | string, token: Token): number => {
  return Number(input) / 10 ** token.decimals
}

export function feeToHuman(fees: Fees): string {
  return toHuman(fees.amount, fees.token).toFixed(10)
}

/**
 * Formats a numerical amount into a human-readable, compact string representation.
 * For numbers lower than 1, display fully with a maximum of 10 decimal places
 * @param amount - The amount to be formatted. For example, `1234567`.
 * @returns The amount formatted as a human-readable string. For example, `"1.23M"`.
 */
export const formatAmount = (amount: number): string => {
  if (amount < 1) {
    return new Intl.NumberFormat('en-US', {
      // minimumFractionDigits: 1, // See once Snowbridge issue is fixed
      maximumFractionDigits: 8,
    }).format(amount)
  } else {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short',
      // minimumFractionDigits: 2, // See once Snowbridge issue is fixed
      maximumFractionDigits: 3,
    }).format(amount)
  }
}

export async function lookupName(network: Network, address: string): Promise<string | null> {
  switch (network) {
    case Network.Ethereum: {
      try {
        const provider = new ethers.CloudflareProvider()
        return await provider.lookupAddress(address)
      } catch (error) {
        // Do not throw an error here
        console.log(error)
        return null
      }
    }
    case Network.Polkadot: {
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
  },
  [Environment.Mainnet]: {
    etherscan: 'https://etherscan.io/',
    subscan_assethub: 'https://assethub-polkadot.subscan.io/',
    subscan_brigehub: 'https://bridgehub-polkadot.subscan.io/',
  },
}

export function getExplorerLink(transfer: StoredTransfer): string | undefined {
  const {
    environment,
    sourceChain: { network },
    sendResult: result,
    sender,
  } = transfer
  const explorersUrls = EXPLORERS[environment]
  switch (network) {
    case Network.Ethereum: {
      if (result?.success?.ethereum && 'transactionHash' in result.success.ethereum)
        return `${removeURLSlash(explorersUrls.etherscan)}/tx/${result.success.ethereum.transactionHash}`
      return `${removeURLSlash(explorersUrls.etherscan)}/address/${sender}`
    }
    case Network.Polkadot: {
      if (result?.success?.assetHub && 'submittedAtHash' in result.success.assetHub)
        return `${removeURLSlash(explorersUrls.subscan_assethub)}/block/${result.success.assetHub.submittedAtHash}`
      return `${removeURLSlash(explorersUrls.subscan_assethub)}/account/${sender}`
    }
    default:
      console.log(`Unsupported network: ${network}`)
  }
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
      return '~2 min'
    case Direction.WithinEthereum:
      return '~5 min'

    // Should never happen
    default:
      return 'N/A'
  }
}
