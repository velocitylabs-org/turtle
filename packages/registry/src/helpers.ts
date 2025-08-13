import type { Chain, Origin, TokenStandard } from './types'

export function rpcConnectionAsHttps(rpc?: string): string {
  if (!rpc) return ''
  return rpc.replace('wss://', 'https://')
}

export function isAssetHub(chain: Chain): boolean {
  return chain.network === 'Polkadot' && chain.chainId === 1000
}

export function parachain(paraId: number): Origin {
  return {
    type: 'Polkadot',
    paraId,
  }
}

export function snowbridgeWrapped(): Origin {
  return {
    type: 'Ethereum',
    bridge: 'Snowbridge',
  }
}

export function ethereumOrigin(standard: TokenStandard): Origin {
  return {
    type: 'Ethereum',
    standard,
  }
}

export function getDestChainId(destChain: Chain): string {
  switch (destChain.network) {
    case 'Ethereum': {
      return `{"parents":"2","interior":{"X1":{"GlobalConsensus":{"Ethereum":{"chainId":"${destChain.chainId}"}}}}}`
    }
    default:
      return destChain.chainId.toString()
  }
}
