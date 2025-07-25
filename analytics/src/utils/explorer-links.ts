import { chainsByUid } from '@velocitylabs-org/turtle-registry'
import type { TxDetailView } from '@/models/tx-detail-view'

interface ExplorerLinks {
  name: string
  url: string
}

interface ExplorerConfig {
  name: string
  baseUrl: string
  txPath: string
  addressPath: string
}

const explorers: Record<string, ExplorerConfig> = {
  etherscan: {
    name: 'Etherscan',
    baseUrl: 'https://etherscan.io',
    txPath: '/tx/',
    addressPath: '/address/',
  },
  subscanPolkadot: {
    name: 'Subscan',
    baseUrl: 'https://polkadot.subscan.io',
    txPath: '/extrinsic/',
    addressPath: '/account/',
  },
  subscanKusama: {
    name: 'Subscan',
    baseUrl: 'https://kusama.subscan.io',
    txPath: '/extrinsic/',
    addressPath: '/account/',
  },
  moonscan: {
    name: 'Moonscan',
    baseUrl: 'https://moonscan.io',
    txPath: '/tx/',
    addressPath: '/address/',
  },
  xcscan: {
    name: 'Xcscan',
    baseUrl: 'https://xcscan.io',
    txPath: '/tx/#',
    addressPath: '/?search=',
  },
}

export default function getExplorerLinks(tx: TxDetailView): ExplorerLinks[] | undefined {
  const sourceChain = chainsByUid[tx.sourceChainUid]
  if (!sourceChain) {
    console.warn(`Chain not found for UID: ${tx.sourceChainUid}`)
    return undefined
  }

  const { network, walletType, name } = sourceChain
  const { senderAddress, txHashId, status } = tx
  const isSucceeded = status === 'succeeded'

  function buildHashLink(config: ExplorerConfig, txHash: string): ExplorerLinks {
    return {
      name: config.name,
      url: `${config.baseUrl}${config.txPath}${txHash}`,
    }
  }

  function buildAddressLink(config: ExplorerConfig, address: string): ExplorerLinks {
    const baseUrl = `${config.baseUrl}${config.addressPath}${address}`
    const isSubscan = config.name === 'Subscan'

    return {
      name: config.name,
      url: isSubscan ? `${baseUrl}?tab=xcm_transfer` : baseUrl,
    }
  }

  function getXcscanLink(): ExplorerLinks {
    if (isSucceeded) {
      return buildAddressLink(explorers.xcscan, txHashId)
    } else {
      return buildAddressLink(explorers.xcscan, senderAddress)
    }
  }

  function getSubstrateEVMLink(chainName: string): ExplorerLinks {
    return {
      name: 'Subscan',
      url: `https://${chainName.toLowerCase()}.subscan.io/account/${senderAddress}?tab=xcm_transfer`,
    }
  }

  switch (network) {
    case 'Ethereum': {
      const etherscanLink = isSucceeded
        ? buildHashLink(explorers.etherscan, txHashId)
        : buildAddressLink(explorers.etherscan, senderAddress)
      return [etherscanLink]
    }

    case 'Polkadot': {
      if (walletType === 'SubstrateEVM') {
        return [getSubstrateEVMLink(name), getXcscanLink()]
      }

      if (name === 'Moonbeam') {
        const moonscanLink = isSucceeded
          ? buildHashLink(explorers.moonscan, txHashId)
          : buildAddressLink(explorers.moonscan, senderAddress)
        return [moonscanLink, getXcscanLink()]
      }

      const subscanLink = buildAddressLink(explorers.subscanPolkadot, senderAddress)
      return [subscanLink, getXcscanLink()]
    }

    case 'Kusama': {
      if (walletType === 'SubstrateEVM') {
        return [getSubstrateEVMLink(name), getXcscanLink()]
      }

      const subscanLink = buildAddressLink(explorers.subscanKusama, senderAddress)
      return [subscanLink, getXcscanLink()]
    }

    default:
      console.warn(`Unsupported network: ${network}`)
      return undefined
  }
}
