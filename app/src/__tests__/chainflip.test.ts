import { describe, expect, it } from '@jest/globals'
import {
  Arbitrum,
  AssetHub,
  arbitrumOrigin,
  Ethereum,
  ethereumOrigin,
  Polkadot,
  populateTokens,
  sharedArbitrumTokenBase,
  sharedEthTokenBase,
} from '@velocitylabs-org/turtle-registry'
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

describe('populateTokens function', () => {
  it('should handle ETH token with special case for Ethereum suffix', () => {
    const ethereumTokens = populateTokens(sharedEthTokenBase, 'e', ethereumOrigin)
    const arbitrumTokens = populateTokens(sharedArbitrumTokenBase, 'arb', arbitrumOrigin)

    expect(ethereumTokens.ETH.id).toBe('eth')
    expect(arbitrumTokens.ETH.id).toBe('eth.arb')
    expect(arbitrumTokens.USDC.id).toBe('usdc.arb')
    expect(arbitrumTokens.ETH.origin).toEqual({ type: 'Arbitrum', standard: 'Native' })
    expect(arbitrumTokens.USDC.origin).toEqual({ type: 'Arbitrum', standard: 'ERC20' })
  })
})
