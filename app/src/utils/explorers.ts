import { captureException } from '@sentry/nextjs'
import type { StoredTransfer } from '@/models/transfer'
import { isChainflipSwap } from './chainflip'
import { isSwap } from './transfer'

const EXPLORERS = {
  // Ethereum
  etherscan: 'https://etherscan.io/',

  // Polkadot
  subscan_polkadot: 'https://polkadot.subscan.io/',
  xcscan: 'https://xcscan.io/?search=',

  // Kusama
  subscan_kusama: 'https://kusama.subscan.io/',

  // Chainflip
  chainflip: 'https://scan.chainflip.io/',
}

export const getChainflipExplorerLink = (swap: StoredTransfer, chainflipSwapId?: string): string | undefined => {
  if (chainflipSwapId) return `${removeURLSlash(EXPLORERS.chainflip)}/swaps/${chainflipSwapId}`
  if (swap.uniqueTrackingId) return `${removeURLSlash(EXPLORERS.chainflip)}/channels/${swap.uniqueTrackingId}`
}

export function getExplorerLink(transfer: StoredTransfer): string | undefined {
  const { sourceChain, destChain, id: txHash, sourceToken, destinationToken, sender } = transfer

  // Chainflip explorer link - Not relying on network
  const isChainflip = isChainflipSwap(transfer.sourceChain, destChain, sourceToken, destinationToken)
  if (isChainflip) return getChainflipExplorerLink(transfer)

  switch (sourceChain.network) {
    case 'Ethereum': {
      if (txHash) return `${removeURLSlash(EXPLORERS.etherscan)}/tx/${txHash}`

      // Default Ethereum network explorer link:
      return `${removeURLSlash(EXPLORERS.etherscan)}/address/${sender}`
    }

    case 'Polkadot': {
      // XCM Transfer to xcscan
      if (!isSwap(transfer)) return `${EXPLORERS.xcscan}${txHash}`

      // Swap and Fallback to extrinsic subscan
      return getCustomSubscanLink(sourceChain.name, txHash)
    }

    case 'Kusama': {
      // Default Kusama network explorer link:
      return `${removeURLSlash(EXPLORERS.subscan_kusama)}/account/${sender}?tab=xcm_transfer`
    }

    default:
      console.error(`Failed to create block explorer link for network: ${sourceChain.network}`)
      captureException(`Failed to create block explorer link for network: ${sourceChain.network}`, {
        level: 'error',
        extra: { transfer },
      })
  }
}

/**
 * Generates the subscan explorer link
 * @param chainName - The chain name
 * @param txHash - The transaction hash
 * @returns The subscan link
 */
const getCustomSubscanLink = (chainName: string, txHash: string) => {
  return `https://${chainName.toLowerCase()}.subscan.io/extrinsic/${txHash}`
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
