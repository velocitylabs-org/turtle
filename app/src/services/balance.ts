import { Token } from '@/models/token'
import * as Snowbridge from '@snowbridge/api'
import {
  assetErc20Balance,
  erc20TokenToAssetLocation,
  palletAssetsBalance,
} from '@snowbridge/api/dist/assets'
import { toHuman } from '../utils/transfer'

export interface Erc20Balance {
  value: bigint
  decimals: number
  symbol: string
  formatted: string
}

export const fetchAssetHubBalance = async (
  context: Snowbridge.Context,
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

export const fetchEthereumBalance = async (
  context: Snowbridge.Context,
  token: Token,
  address: string,
): Promise<Erc20Balance> => {
  const res = await assetErc20Balance(context, token.address, address)

  const balance = res?.balance ?? 0n

  return {
    value: balance,
    decimals: token.decimals,
    symbol: token.symbol,
    formatted: toHuman(balance, token).toString(),
  }
}
