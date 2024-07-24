import * as Snowbridge from '@snowbridge/api'

import { isDevelopment, isPreview } from '@/utils/env'
import { Environment } from '@/store/environmentStore'
import { SnowbridgeStatus } from '@/models/snowbridge'
import { Direction } from '@/services/transfer'

export const shouldUseTestnet = isDevelopment || isPreview
export const currentEnvironement = shouldUseTestnet ? Environment.Testnet : Environment.Mainnet

/**
 * Given an app Environment, return the adequate Snowbridge Api Environment scheme.
 *
 *
 * @param env - The environment in which the app is operating on
 * @returns The adequate SnowbridgeEnvironment for the given input
 */
export function getEnvironment(env: Environment): Snowbridge.environment.SnowbridgeEnvironment {
  const network = toSnowbridgeNetwork(env)
  const x = Snowbridge.environment.SNOWBRIDGE_ENV[network]

  if (x === undefined) {
    throw Error(`Unknown environment`)
  }

  return x
}

export async function getContext(
  environment: Snowbridge.environment.SnowbridgeEnvironment,
): Promise<Snowbridge.Context> {
  const { config } = environment

  return await Snowbridge.contextFactory({
    ethereum: {
      execution_url: config.ETHEREUM_API('3Abd1KfeBZgvuM0YSAkoIwGRCC26z5lw'),
      beacon_url: config.BEACON_HTTP_API,
    },
    polkadot: {
      url: {
        bridgeHub: config.BRIDGE_HUB_URL,
        assetHub: config.ASSET_HUB_URL,
        relaychain: config.RELAY_CHAIN_URL,
        parachains: config.PARACHAINS,
      },
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

export async function getSnowBridgeContext(
  environment = currentEnvironement,
): Promise<Snowbridge.Context> {
  const snowbridgeEnv = getEnvironment(environment)
  return await getContext(snowbridgeEnv)
}

export async function getSnowBridgeStatus(): Promise<SnowbridgeStatus> {
  const snowbridgCtx = await getSnowBridgeContext()
  const bridgeStatus = await Snowbridge.status.bridgeStatusInfo(snowbridgCtx)
  return {
    ethBridgeStatus: bridgeStatus.toEthereum.latencySeconds,
    polkadotBridgeStatus: bridgeStatus.toPolkadot.latencySeconds,
  }
}

export const bridgeProgressionValue = (
  bridgeStatus: SnowbridgeStatus,
  transferDate: Date,
  transferDirection: Direction,
) => {
  const filteredBridgeTimestamp =
    transferDirection === Direction.ToPolkadot
      ? bridgeStatus.polkadotBridgeStatus * 1000
      : bridgeStatus.ethBridgeStatus * 1000
  const targetTimestamp = filteredBridgeTimestamp + new Date(transferDate).getTime()

  const currentTimestamp = new Date().getTime()
  const diffTimeFromTransfer = targetTimestamp - currentTimestamp
  const progression = (diffTimeFromTransfer / targetTimestamp) * 100
  return progression
}
