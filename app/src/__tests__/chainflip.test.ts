import { describe, expect, it } from '@jest/globals'
import { Arbitrum, AssetHub, Ethereum, Polkadot } from '@velocitylabs-org/turtle-registry'
import { type ChainflipChain, chainflipToRegistryChain } from '@/utils/chainflip'

const ChainflipChains: ChainflipChain[] = ['Ethereum', 'Polkadot', 'Assethub', 'Arbitrum']

describe('Chainflip Chains', () => {
  it('should match the corresponding Turtle registry chains', () => {
    const registryChains = ChainflipChains.map(chain => {
      return chainflipToRegistryChain(chain)
    })
    expect(registryChains).toStrictEqual([Ethereum, Polkadot, AssetHub, Arbitrum])
    expect(() => chainflipToRegistryChain('Unknown' as ChainflipChain)).toThrow()
  })
})
