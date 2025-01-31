import { Mainnet } from '@/registry/mainnet/mainnet'
import { routes } from '@/registry/mainnet/routes'
import { describe, expect, it } from '@jest/globals'

describe('Routes', () => {
  it('should have correctly structured routes', () => {
    routes.forEach(route => {
      expect(route).toHaveProperty('from')
      expect(route).toHaveProperty('to')
      expect(route).toHaveProperty('sdk')
      expect(route).toHaveProperty('tokens')
      expect(Array.isArray(route.tokens)).toBe(true)
    })
  })

  it('should not have any duplicate routes', () => {
    const routeSet = new Set(routes.map(r => `${r.from}-${r.to}`))
    expect(routeSet.size).toBe(routes.length)
  })

  it('should have valid routes with existing chains', () => {
    const chainUids = new Set(Mainnet.REGISTRY.chains.map(chain => chain.uid))
    routes.forEach(route => {
      expect(chainUids.has(route.from)).toBe(true)
      expect(chainUids.has(route.to)).toBe(true)
    })
  })

  it('should only include registered tokens in routes', () => {
    const tokenIds = new Set(Mainnet.REGISTRY.tokens.map(t => t.id))
    routes.forEach(route => {
      route.tokens.forEach(token => {
        expect(tokenIds.has(token)).toBe(true)
      })
    })
  })

  it('should not have duplicate tokens in routes', () => {
    routes.forEach(route => {
      const tokenSet = new Set(route.tokens)
      expect(tokenSet.size).toBe(route.tokens.length)
    })
  })
})

describe('Chains', () => {
  it('should have valid chain properties', () => {
    Mainnet.REGISTRY.chains.forEach(chain => {
      expect(chain).toHaveProperty('uid')
      expect(chain).toHaveProperty('name')
      expect(chain).toHaveProperty('chainId')
      expect(chain).toHaveProperty('network')
      expect(chain).toHaveProperty('supportedAddressTypes')
      expect(chain).toHaveProperty('walletType')
    })
  })

  it('should not have duplicate chains', () => {
    const chainIds = new Set(Mainnet.REGISTRY.chains.map(c => c.uid))
    expect(chainIds.size).toBe(Mainnet.REGISTRY.chains.length)
  })
})

describe('Tokens', () => {
  it('should have valid token properties', () => {
    Mainnet.REGISTRY.tokens.forEach(token => {
      expect(token).toHaveProperty('id')
      expect(token).toHaveProperty('name')
      expect(token).toHaveProperty('symbol')
      expect(token).toHaveProperty('decimals')
    })
  })

  it('should not have duplicate tokens', () => {
    const tokenIds = new Set(Mainnet.REGISTRY.tokens.map(t => t.id))
    expect(tokenIds.size).toBe(Mainnet.REGISTRY.tokens.length)
  })

  it('should have valid assetUid mappings', () => {
    Mainnet.REGISTRY.assetUid.forEach((tokenMap, chainUid) => {
      // Ensure the chain exists in the registry
      expect(Mainnet.REGISTRY.chains.some(c => c.uid === chainUid)).toBe(true)

      tokenMap.forEach((assetUid, tokenId) => {
        // Ensure the token ID (key) exists in the registry tokens
        expect(Mainnet.REGISTRY.tokens.some(t => t.id === tokenId)).toBe(true)

        // Ensure assetUid has either 'symbol' or 'id' property
        expect('symbol' in assetUid || 'id' in assetUid).toBe(true)
      })
    })
  })
})
