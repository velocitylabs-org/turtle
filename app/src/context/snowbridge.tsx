import { Context, environment, status } from '@snowbridge/api'
import {
  rpcConnectionAsHttps,
  AssetHub,
  BridgeHub,
  Polkadot,
  SNOWBRIDGE_MAINNET_PARACHAIN_URLS,
  Network,
} from '@velocitylabs-org/turtle-registry'
import { AbstractProvider, AlchemyProvider } from 'ethers'
import { SnowbridgeStatus } from '@/models/snowbridge'

const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY || ''

/**
 * Given a network, return the adequate Snowbridge Api Environment scheme.
 *
 *
 * @param network - The network in which the app is operating on
 * @returns The adequate SnowbridgeEnvironment for the given input
 */
export function getSbEnvironment(network: Network = 'Polkadot'): environment.SnowbridgeEnvironment {
  const sbNetwork = toSnowbridgeNetwork(network)
  if (sbNetwork === undefined)
    throw Error(`Snowbridge doesn't support the given Network`)

  const env = environment.SNOWBRIDGE_ENV[sbNetwork]

  // Apply custom api endpoints for each supported network
  if (network === 'Polkadot') {
    env.config.ASSET_HUB_PARAID = AssetHub.chainId
    env.config.BRIDGE_HUB_PARAID = BridgeHub.chainId
    env.config.RELAY_CHAIN_URL = rpcConnectionAsHttps(Polkadot.rpcConnection)
    env.config.PARACHAINS = SNOWBRIDGE_MAINNET_PARACHAIN_URLS
  }
  else {
    throw Error(`Snowbridge doesn't support the given Network`)
  }

  return env
}

export async function getContext(environment: environment.SnowbridgeEnvironment): Promise<Context> {
  const { config, ethChainId, name } = environment
  const ethereumProvider = new AlchemyProvider(ethChainId, ALCHEMY_API_KEY)
  const ethChains: { [ethChainId: string]: string | AbstractProvider } = {}
  ethChains[ethChainId.toString()] = ethereumProvider

  return new Context({
    environment: name,
    ethereum: {
      beacon_url: config.BEACON_HTTP_API,
      ethChainId,
      ethChains: { '1': config.ETHEREUM_CHAINS[1](ALCHEMY_API_KEY) },
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
 * Convert a Network value to the corresponding network string value
 * that the Snowbridge/api SDK understands.
 * @param network - The network in which the app is operating
 * @returns the corresponding network value that Snowbridge/api understands
 */
export function toSnowbridgeNetwork(network: Network): string | undefined {
  switch (network) {
    case 'Polkadot':
    case 'Ethereum':
      return 'polkadot_mainnet'
    default:
      return undefined
  }
}

export async function getSnowBridgeContext(network: Network = 'Polkadot'): Promise<Context> {
  return await getContext(getSbEnvironment(network))
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
