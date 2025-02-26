import { Token } from '@/models/token'
import { CACHE_REVALIDATE_IN_SECONDS } from '@/utils/consts'
import { useQuery } from '@tanstack/react-query'
import { TokenPrice, TokenPriceResult } from '@/models/balance'

const getCoingekoId = (token: Token): string =>
  token.coingeckoId ?? token.name.toLocaleLowerCase().replaceAll(' ', '-')

const getTokenPrice = async (tokenId: string): Promise<TokenPrice | null> => {
  try {
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

const useTokenPrice = (token?: Token | null): TokenPriceResult => {
  const {
    data: price,
    isLoading,
    error: isTokenPriceError,
  } = useQuery({
    queryKey: ['tokenPrice', token?.id],
    queryFn: async () => {
      if (!token) return null
      return await getTokenPrice(getCoingekoId(token))
    },
    staleTime: CACHE_REVALIDATE_IN_SECONDS * 1000, // specified in miliseconds
  })

  if (isTokenPriceError) {
    console.error('useTokenPrice: Failed to fetch with error:', isTokenPriceError.message)
    // captureException(isTokenPriceError.message) - Sentry
    return { price: undefined, loading: false }
  }

  return { price: price?.usd, loading: isLoading }
}

export default useTokenPrice
