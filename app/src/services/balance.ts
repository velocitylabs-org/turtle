import { Token } from '@/models/token'
import * as Snowbridge from '@snowbridge/api'
import { erc20TokenToAssetLocation, palletAssetsBalance } from '@snowbridge/api/dist/assets'
import { toHuman } from '../utils/transfer'

export const fetchAssetHubBalance = async (
  context: Snowbridge.Context,
  token: Token,
  address: string,
) => {
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
