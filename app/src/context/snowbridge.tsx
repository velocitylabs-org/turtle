import { SnowbridgeStatus } from '@/models/snowbridge'
import { SNOWBRIDGE_MAINNET_PARACHAIN_URLS } from '@/registry'
import { rpcConnectionAsHttps } from '@/registry/helpers'
import { AssetHub, BridgeHub, RelayChain } from '@/registry/mainnet/chains'
import { Environment } from '@/store/environmentStore'
import { Context, environment, status } from '@snowbridge/api'

const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY || ''

/**
 * Given an app Environment, return the adequate Snowbridge Api Environment scheme.
 *
 *
 * @param env - The environment in which the app is operating on
 * @returns The adequate SnowbridgeEnvironment for the given input
 */
export function getEnvironment(env: Environment): environment.SnowbridgeEnvironment {
  const network = toSnowbridgeNetwork(env)
  const x = environment.SNOWBRIDGE_ENV[network]

  // apply custom api endpoints
  if (env === Environment.Mainnet) {
    x.config.ASSET_HUB_PARAID = AssetHub.chainId
    x.config.BRIDGE_HUB_PARAID = BridgeHub.chainId
    x.config.RELAY_CHAIN_URL = rpcConnectionAsHttps(RelayChain.rpcConnection)
    x.config.PARACHAINS = SNOWBRIDGE_MAINNET_PARACHAIN_URLS
  }
  // TODO support Paseo testnet

  if (x === undefined) {
    throw Error(`Unknown environment`)
  }

  return x
}

export async function getContext(environment: environment.SnowbridgeEnvironment): Promise<Context> {
  const { config } = environment

  return new Context({
    ethereum: {
      execution_url: config.ETHEREUM_API(ALCHEMY_API_KEY),
      beacon_url: config.BEACON_HTTP_API,
    },
    polkadot: {
      assetHubParaId: config.ASSET_HUB_PARAID,
      bridgeHubParaId: config.BRIDGE_HUB_PARAID,
      relaychain: config.RELAY_CHAIN_URL,
      parachains: config.PARACHAINS,
    },
    appContracts: {
      gateway: config.GATEWAY_CONTRACT,
      beefy: config.BEEFY_CONTRACT,
    },
  })
}

/**
 * Convert a given Environment value to the corresponding network string value
 * that the Snowbridge/api SDK understands.
 * @param env - The environmnet in which the app is operating
 * @returns the corresponding network value that Snowbridge/api understands
 */
export function toSnowbridgeNetwork(env: Environment): string {
  switch (env) {
    case Environment.Mainnet:
      return 'polkadot_mainnet'
    case Environment.Testnet:
      return 'rococo_sepolia'
  }
}

export async function getSnowBridgeContext(environment: Environment): Promise<Context> {
  const snowbridgeEnv = getEnvironment(environment)
  return await getContext(snowbridgeEnv)
}

export async function getSnowBridgeEtimatedTransferDuration(
  snowbridgeCtx: Context,
): Promise<SnowbridgeStatus> {
  const bridgeStatus = await status.bridgeStatusInfo(snowbridgeCtx)
  return {
    toEthereum: bridgeStatus.toEthereum.latencySeconds,
    toPolkadot: bridgeStatus.toPolkadot.latencySeconds,
  }
}
