import { TokenPrice } from '@/models/balance'
import { Token } from '@/models/token'
import { REGISTRY } from '@/registry/mainnet/mainnet'
import { deepEqual, TMultiLocation } from '@paraspell/sdk'

export const getCoingekoId = (token: Token): string =>
  token.coingeckoId ?? token.name.toLocaleLowerCase().replaceAll(' ', '-')

export const getTokenPrice = async (token: Token): Promise<TokenPrice | null> => {
  try {
    const tokenId = getCoingekoId(token)
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId.toLocaleLowerCase()}&vs_currencies=usd`
    const options = { method: 'GET', headers: { accept: 'application/json' } }
    const result = await fetch(url, options)

    if (!result.ok) throw new Error(`Failed to fetch ${tokenId} price from coingecko`)

    return (await result.json())[tokenId.toLocaleLowerCase()] as TokenPrice
  } catch (error) {
    console.log('getTokenPrice error:', error)
    return null
  }
}

export function getTokenByMultilocation(multilocation: TMultiLocation): Token | undefined {
  const token = REGISTRY.tokens.find(token => deepEqual(token.multilocation, multilocation))

  // Usually a token should be found, so log a warning if not
  if (!token) {
    // captureException(new Error('Token not found by multilocation'), {
    //   level: 'warning',
    //   extra: { multilocation },
    // }) - Sentry
    console.log('Token not found by multilocation', multilocation)
  }

  return token
}

export function isSameToken(token1: Token, token2: Token): boolean {
  return token1.id === token2.id
}
