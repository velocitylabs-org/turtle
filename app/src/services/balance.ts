import { Token } from '@/models/token'

export interface TokenPrice {
  usd: number
}

export interface Erc20Balance {
  value: bigint
  decimals: number
  symbol: string
  formatted: string
}

export const getTokenPrice = async (tokenId: string): Promise<TokenPrice | null> => {
  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId.toLocaleLowerCase()}&vs_currencies=usd`
    const options = { method: 'GET', headers: { accept: 'application/json' } }
    const result = await fetch(url, options)

    if (!result.ok) throw new Error('Failed to fetch token price')

    return (await result.json())[tokenId.toLocaleLowerCase()] as TokenPrice
  } catch (error) {
    console.log('getTokenPrice error:', error)
    return null
  }
}

export const getApiTokenPrice = async (token: Token) => {
  const response = await fetch(`/api/tokenPrice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  })

  if (!response.ok) {
    const { error } = await response.json()
    throw new Error(error || 'Failed to fetch token price')
  }
  return (await response.json()) as number
}
