import { describe, expect, it } from '@jest/globals'
import { MainnetRegistry, routes } from '@velocitylabs-org/turtle-registry'

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
    const filteredRoutes = routes.filter(r => r.sdk !== 'ChainflipApi')
    const routeSet = new Set(filteredRoutes.map(r => `${r.from}-${r.to}`))
    expect(routeSet.size).toBe(filteredRoutes.length)
  })

  it('should have valid routes with existing chains', () => {
    const chainUids = new Set(MainnetRegistry.chains.map(chain => chain.uid))
    routes.forEach(route => {
      expect(chainUids.has(route.from)).toBe(true)
      expect(chainUids.has(route.to)).toBe(true)
    })
  })

  it('should only include registered tokens in routes', () => {
    const tokenIds = new Set(MainnetRegistry.tokens.map(t => t.id))
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
    MainnetRegistry.chains.forEach(chain => {
      expect(chain).toHaveProperty('uid')
      expect(chain).toHaveProperty('name')
      expect(chain).toHaveProperty('chainId')
      expect(chain).toHaveProperty('network')
      expect(chain).toHaveProperty('supportedAddressTypes')
      expect(chain).toHaveProperty('walletType')
    })
  })

  it('should not have duplicate chains', () => {
    const chainIds = new Set(MainnetRegistry.chains.map(c => c.uid))
    expect(chainIds.size).toBe(MainnetRegistry.chains.length)
  })
})

describe('Tokens', () => {
  it('should have valid token properties', () => {
    MainnetRegistry.tokens.forEach(token => {
      expect(token).toHaveProperty('id')
      expect(token).toHaveProperty('name')
      expect(token).toHaveProperty('symbol')
      expect(token).toHaveProperty('decimals')
    })
  })

  it('should not have duplicate tokens', () => {
    const tokenIds = new Set(MainnetRegistry.tokens.map(t => t.id))
    expect(tokenIds.size).toBe(MainnetRegistry.tokens.length)
  })

  it('should have valid assetUid mappings', () => {
    MainnetRegistry.assetUid.forEach((tokenMap, chainUid) => {
      // Ensure the chain exists in the registry
      expect(MainnetRegistry.chains.some(c => c.uid === chainUid)).toBe(true)

      tokenMap.forEach((assetUid, tokenId) => {
        // Ensure the token ID (key) exists in the registry tokens
        expect(MainnetRegistry.tokens.some(t => t.id === tokenId)).toBe(true)

        // Ensure assetUid has either 'symbol' or 'id' property
        expect('symbol' in assetUid || 'id' in assetUid).toBe(true)
      })
    })
  })
})
