import { describe, expect, it } from '@jest/globals'
import { AssetHub, Ethereum, Polkadot } from '@velocitylabs-org/turtle-registry'
import { type ChainflipChain, toRegistryChain } from '@/utils/chainflip'

const ChainflipChains: ChainflipChain[] = ['Ethereum', 'Polkadot', 'Assethub']

describe('Chainflip Chains', () => {
  it('should match the corresponding Turtle registry chains', () => {
    const registryChains = ChainflipChains.map(chain => {
      return toRegistryChain(chain)
    })
    expect(registryChains).toStrictEqual([Ethereum, Polkadot, AssetHub])
    expect(() => toRegistryChain('Unknown' as ChainflipChain)).toThrow()
  })
})
