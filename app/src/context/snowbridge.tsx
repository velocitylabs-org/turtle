import { Context, contextConfigFor, environment, status } from '@snowbridge/api'
import {
  Environment,
  rpcConnectionAsHttps,
  AssetHub,
  BridgeHub,
  Polkadot,
  SNOWBRIDGE_MAINNET_PARACHAIN_URLS,
} from '@velocitylabs-org/turtle-registry'
import { SnowbridgeStatus } from '@/models/snowbridge'

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
    x.config.RELAY_CHAIN_URL = rpcConnectionAsHttps(Polkadot.rpcConnection)
    x.config.PARACHAINS = SNOWBRIDGE_MAINNET_PARACHAIN_URLS
  }
  // TODO support Paseo testnet

  if (x === undefined) {
    throw Error(`Unknown environment`)
  }

  return x
}

export async function getSnowBridgeContext(): Promise<Context> {
  const snowbridgeNetwork = toSnowbridgeNetwork(Environment.Mainnet)
  const config = contextConfigFor(snowbridgeNetwork)

  return new Context(config)
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
  }
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
