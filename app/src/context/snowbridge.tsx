import { Context, contextConfigFor, environment, status } from '@snowbridge/api'
import {
  AssetHub,
  BridgeHub,
  type Network,
  Polkadot,
  rpcConnectionAsHttps,
  SNOWBRIDGE_MAINNET_PARACHAIN_URLS,
} from '@velocitylabs-org/turtle-registry'
import type { SnowbridgeStatus } from '@/models/snowbridge'

/**
 * Given a network, return the adequate Snowbridge Api Environment scheme.
 *
 *
 * @param network - The network in which the app is operating on
 * @returns The adequate SnowbridgeEnvironment for the given input
 */
export function getSbEnvironment(network: Network = 'Polkadot'): environment.SnowbridgeEnvironment {
  const sbNetwork = toSnowbridgeNetwork(network)
  if (sbNetwork === undefined) throw Error(`Snowbridge doesn't support the given Network`)

  const env = environment.SNOWBRIDGE_ENV[sbNetwork]

  // Apply custom api endpoints for each supported network
  if (network === 'Polkadot') {
    env.config.ASSET_HUB_PARAID = AssetHub.chainId
    env.config.BRIDGE_HUB_PARAID = BridgeHub.chainId
    env.config.RELAY_CHAIN_URL = rpcConnectionAsHttps(Polkadot.rpcConnection)
    env.config.PARACHAINS = SNOWBRIDGE_MAINNET_PARACHAIN_URLS
  } else {
    throw Error(`Snowbridge doesn't support the given Network`)
  }

  return env
}

export async function getSnowBridgeContext(network: Network = 'Polkadot'): Promise<Context> {
  const snowbridgeNetwork = toSnowbridgeNetwork(network)
  if (!snowbridgeNetwork) throw new Error(`Snowbridge context not supported on ${network}`)

  const config = contextConfigFor(snowbridgeNetwork)
  return new Context(config)
}

/**
 * Convert a Network value to the corresponding network string value
 * that the Snowbridge/api SDK understands.
 * @param network - The network in which the app is operating
 * @returns the corresponding network value that Snowbridge/api understands
 */
function toSnowbridgeNetwork(network: Network): 'polkadot_mainnet' | undefined {
  switch (network) {
    case 'Polkadot':
    case 'Ethereum':
      return 'polkadot_mainnet'
    default:
      return undefined
  }
}

// This is not used anywhere in the app – delete?
export async function getSnowBridgeEtimatedTransferDuration(snowbridgeCtx: Context): Promise<SnowbridgeStatus> {
  const bridgeStatus = await status.bridgeStatusInfo(snowbridgeCtx)
  return {
    toEthereum: bridgeStatus.toEthereum.latencySeconds,
    toPolkadot: bridgeStatus.toPolkadot.latencySeconds,
  }
}
