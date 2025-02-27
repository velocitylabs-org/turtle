import { TokenPrice } from '@/models/balance'
import { Token } from '@/models/token'

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
