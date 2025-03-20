import { StoredTransfer } from '@/models/transfer'
import { AssetHub } from '@/registry/mainnet/chains'
import { Environment } from '@/stores/environmentStore'

const EXPLORERS: { [environment in Environment]: { [explorerName: string]: string } } = {
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
    sendResult: txHash,
    sender,
    id,
    uniqueTrackingId,
  } = transfer
  const explorersUrls = EXPLORERS[environment]

  switch (network) {
    case 'Ethereum': {
      if (txHash) return `${removeURLSlash(explorersUrls.etherscan)}/tx/${txHash}`

      // Default Ethereum network explorer link:
      return `${removeURLSlash(explorersUrls.etherscan)}/address/${sender}`
    }
    case 'Polkadot': {
      if (txHash) return `${removeURLSlash(explorersUrls.subscan_assethub)}/extrinsic/${txHash}`

      if (uniqueTrackingId) {
        const path = getSubdomainPath(explorersUrls.subscan_relaychain)
        return `${removeURLSlash(explorersUrls.subscan_relaychain)}/xcm_message/${path}-${uniqueTrackingId}`
      }

      if (walletType === 'SubstrateEVM') {
        return getCustomExplorerLink(name, sender)
      }

      if (chainId === AssetHub.chainId)
        return `${removeURLSlash(explorersUrls.subscan_assethub)}/extrinsic/${id}`

      // Default Polkadot network explorer link:
      return `${removeURLSlash(explorersUrls.subscan_relaychain)}/account/${sender}?tab=xcm_transfer`
    }
    default:
      console.log(`Unsupported network: ${network}`)
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
