
import { Environment } from './src/types'
import { rpcConnectionAsHttps } from './src/helpers'
import { AssetHub, Bifrost, BridgeHub, Hydration, Moonbeam, Mythos } from './src/mainnet/chains'
import { Mainnet } from './src/mainnet/mainnet'
import { LocalAssetUid } from './src/types'

const SNOWBRIDGE_MAINNET_PARACHAINS = [AssetHub, BridgeHub, Moonbeam, Bifrost, Hydration, Mythos]

export const REGISTRY = {
  mainnet: Mainnet.REGISTRY,
}

export const SNOWBRIDGE_MAINNET_PARACHAIN_URLS = Object.fromEntries(
  SNOWBRIDGE_MAINNET_PARACHAINS.map(chain => [
    chain.chainId.toString(),
    rpcConnectionAsHttps(chain.rpcConnection),
  ]),
)

export function getAssetUid(
  env: Environment,
  chainId: string,
  tokenId: string,
): LocalAssetUid | undefined {
  return REGISTRY[env].assetUid.get(chainId)?.get(tokenId)
}

export * from './src/helpers'
export * from './src/utils'
export * from './src/types'
export * from './src/mainnet'