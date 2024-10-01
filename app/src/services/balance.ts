import { Network } from '@/models/chain'
import { Token } from '@/models/token'
import { Context } from '@snowbridge/api'
import { erc20TokenToAssetLocation, palletAssetsBalance } from '@snowbridge/api/dist/assets'
import { toHuman } from '../utils/transfer'

export interface TokenPrice {
  usd: number
}

export interface Erc20Balance {
  value: bigint
  decimals: number
  symbol: string
  formatted: string
}

export const fetchAssetHubBalance = async (
  context: Context,
  token: Token,
  address: string,
): Promise<Erc20Balance> => {
  const chainId = (await context.ethereum.api.getNetwork()).chainId
  const multiLocation = erc20TokenToAssetLocation(
    context.polkadot.api.assetHub.registry,
    BigInt(chainId),
    token.address,
  )

  const balance = await palletAssetsBalance(
    context.polkadot.api.assetHub,
    multiLocation,
    address,
    'foreignAssets',
  )

  const fetchedBalance = {
    value: balance ?? 0n,
    decimals: token.decimals,
    symbol: token.symbol,
    formatted: toHuman(balance ?? 0n, token).toString(),
  }
  return fetchedBalance
}

export const getTokenPrice = async (tokenId: string): Promise<TokenPrice | null> => {
  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId.toLocaleLowerCase()}&vs_currencies=usd`
    const options = { method: 'GET', headers: { accept: 'application/json' } }
    const result = await fetch(url, options)
    
    if (!result.ok) throw new Error('Failed to fetch fees tokens value')
    
    return ((await result.json())[tokenId.toLocaleLowerCase()] as TokenPrice)
  } catch (error) {
    console.log('Fees token value fetch error:', error)
    return null
  }
}
export const getErc20TokenUSDValue = async (
  contract: Token['address'],
  network = Network.Ethereum,
): Promise<TokenPrice | null> => {
  try {
    const url = `https://api.coingecko.com/api/v3/simple/token_price/${network.toLowerCase()}?contract_addresses=${contract.toLowerCase()}&vs_currencies=usd`
    const options = { method: 'GET', headers: { accept: 'application/json' } }
    const result = await fetch(url, options)
    if (!result.ok) {
      throw new Error('Failed to fetch ERC20 tokens value')
    }
    return (await result.json()) as TokenPrice
  } catch (error) {
    console.log('ERC20 token value fetch error:', error)
    return null
  }
}
