import { chainsByUid } from '@velocitylabs-org/turtle-registry'
import { TxDetailView } from '@/models/tx-detail-view'

export default function getExplorerLink(tx: TxDetailView): string | undefined {
  const sourceCHain = chainsByUid[tx.sourceChainUid]
  const { network, walletType, name } = sourceCHain
  const sender = tx.senderAddress
  const txHash = tx.txHashId
  const succeeded = tx.status === 'succeeded'
  const explorersUrls = {
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

  switch (network) {
    case 'Ethereum': {
      if (succeeded) return `${removeURLSlash(explorersUrls.etherscan)}/tx/${txHash}`

      // Default Ethereum network explorer link:
      return `${removeURLSlash(explorersUrls.etherscan)}/address/${sender}`
    }
    case 'Polkadot': {
      if (walletType === 'SubstrateEVM') {
        return getCustomExplorerLink(name, sender)
      }

      // Default Polkadot network explorer link:
      return `${removeURLSlash(explorersUrls.subscan_polkadot)}/account/${sender}?tab=xcm_transfer`
    }
    case 'Kusama': {
      if (walletType === 'SubstrateEVM') {
        return getCustomExplorerLink(name, sender)
      }
      // Default Polkadot network explorer link:
      return `${removeURLSlash(explorersUrls.subscan_kusama)}/account/${sender}?tab=xcm_transfer`
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

export const getCustomExplorerLink = (name: string, sender: string) => {
  return `https://${name.toLowerCase()}.subscan.io/account/${sender}?tab=xcm_transfer`
}
