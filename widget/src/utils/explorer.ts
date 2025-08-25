import { AssetHub, KusamaAssetHub } from '@velocitylabs-org/turtle-registry'
import type { StoredTransfer } from '@/models/transfer'

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
}

export function getExplorerLink(transfer: StoredTransfer): string | undefined {
  const {
    sourceChain: { network, chainId, walletType, name },
    sendResult: txHash,
    sender,
    id,
    uniqueTrackingId,
  } = transfer

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

const removeURLSlash = (url: string) => {
  if (url.length === 0) return url
  const lastChar = url.charAt(url.length - 1)
  if (lastChar === '/') {
    return url.slice(0, -1)
  } else {
    return url
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
