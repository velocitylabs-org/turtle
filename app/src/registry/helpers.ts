import { Chain } from '@/models/chain'
import { Origin } from '@/models/token'

export function rpcConnectionAsHttps(rpc?: string): string {
  if (!rpc) return ''
  return rpc.replace('wss://', 'https://')
}

export function isAssetHub(chain: Chain): boolean {
  return chain.network == 'Polkadot' && chain.chainId === 1000
}

export function isEvmBasedChain(chain: Chain): boolean {
  return chain.network === 'Ethereum' || chain.supportedAddressTypes.includes('evm')
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

// The Velocity Labs account on AssetHub 
// Used as a hop account on AH for tokens being moved from EMV-based parachains to Ethereum.
export const ahVlAccount = '13gXC9QmeFyZFY595TMnMLZsEAq34h13xpLTLCuqbrGnTNNv'


export function getHopAhAddress(sourceChain: Chain, destChain: Chain): string | undefined {
  return !isAssetHub(sourceChain) && isEvmBasedChain(sourceChain) && destChain.network === 'Ethereum' ?
   ahVlAccount : undefined
}