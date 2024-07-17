import { ethers } from 'ethers'

import { Network } from '@/models/chain'
import { Token } from '@/models/token'
import { Fees, StoredTransfer } from '@/models/transfer'
import { Environment } from '@/store/environmentStore'

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
      try {
        const provider = new ethers.CloudflareProvider()
        return await provider.lookupAddress(address)
      } catch (error) {
        // Do not throw an error here
        console.log(error)
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
      if (result.success?.ethereum && 'blockNumber' in result.success.ethereum)
        return `${removeURLSlash(explorersUrls.etherscan)}/block/${result.success.ethereum.blockNumber}`
      return `${removeURLSlash(explorersUrls.etherscan)}/address/${sender}`
    }
    case Network.Polkadot: {
      if (result.success?.assetHub && 'blockNumber' in result.success.assetHub)
        return `${removeURLSlash(explorersUrls.subscan_assethub)}/block/${result.success.assetHub.blockNumber.toString()}`
      return `${removeURLSlash(explorersUrls.subscan_assethub)}/account/${sender}`
    }
    default:
      console.log(`Unsupported network: ${network}`)
  }
}
