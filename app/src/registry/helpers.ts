import { Chain } from '@/models/chain'
import { Origin } from '@/models/token'

export function rpcConnectionAsHttps(rpc?: string): string {
  if (!rpc) return ''
  return rpc.replace('wss://', 'https://')
}

export function isAssetHub(chain: Chain): boolean {
  return chain.network == 'Polkadot' && chain.chainId === 1000
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

export type WithAllowedTag<T> = T & { allowed: boolean }
