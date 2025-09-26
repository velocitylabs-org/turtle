import { captureException } from '@sentry/nextjs'
import { AssetHub, KusamaAssetHub } from '@velocitylabs-org/turtle-registry'
import type { StoredTransfer } from '@/models/transfer'
import { isChainflipSwap } from './chainflip'

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
      if (txHash) return `${removeURLSlash(EXPLORERS.subscan_polkadot_ah)}/extrinsic/${txHash}`

      if (sourceChain.chainId === AssetHub.chainId)
        return `${removeURLSlash(EXPLORERS.subscan_polkadot_ah)}/extrinsic/${txHash}`

      // Default Polkadot network explorer link:
      return `${removeURLSlash(EXPLORERS.subscan_polkadot)}/account/${sender}?tab=xcm_transfer`
    }

    case 'Kusama': {
      if (txHash) return `${removeURLSlash(EXPLORERS.subscan_kusama_ah)}/extrinsic/${txHash}`

      if (sourceChain.chainId === KusamaAssetHub.chainId)
        return `${removeURLSlash(EXPLORERS.subscan_kusama_ah)}/extrinsic/${txHash}`

      // Default Polkadot network explorer link:
      return `${removeURLSlash(EXPLORERS.subscan_kusama)}/account/${sender}?tab=xcm_transfer`
    }

    default:
      console.error(`Failed to create block explorer link`)
      captureException('Failed to create block explorer link', { level: 'error', extra: { transfer } })
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
