import { ethers } from 'ethers'
import { Network } from '@/models/chain'

export async function lookupName(network: Network, address: string): Promise<string | null> {
  switch (network) {
    case 'Ethereum': {
      try {
        const provider = new ethers.CloudflareProvider()
        return await provider.lookupAddress(address)
      } catch (error) {
        // Do not throw an error here
        console.log(error)
        return null
      }
    }
    case 'Polkadot': {
      //todo(nuno)
      return null
    }
  }
}
