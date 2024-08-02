import { SnowbridgeStatus } from '@/models/snowbridge'
import { Direction } from '@/services/transfer'
import { Environment } from '@/store/environmentStore'
import { shouldUseTestnet } from '@/utils/env'
import { Context, contextFactory, environment, status } from '@snowbridge/api'

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

  if (x === undefined) {
    throw Error(`Unknown environment`)
  }

  return x
}

export async function getContext(environment: environment.SnowbridgeEnvironment): Promise<Context> {
  const { config } = environment

  return await contextFactory({
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
  environment = shouldUseTestnet ? Environment.Testnet : Environment.Mainnet,
): Promise<Context> {
  const snowbridgeEnv = getEnvironment(environment)
  return await getContext(snowbridgeEnv)
}

export async function getSnowBridgeStatus(snowbridgCtx: Context): Promise<SnowbridgeStatus> {
  const bridgeStatus = await status.bridgeStatusInfo(snowbridgCtx)
  return {
    ethBridgeStatus: bridgeStatus.toEthereum.latencySeconds,
    polkadotBridgeStatus: bridgeStatus.toPolkadot.latencySeconds,
  }
}

/**
 * Calculates the progression value of snowbridge transfer based on its status,
 * the transfer date, and the transfer direction.
 *
 * @param bridgeStatus - Snowbridge's last status. This object contains the bridge status
 * in minutes for both Polkadot and Ethereum directions. If null, the function returns 0.
 * @param transferDate - The date and time when the transfer was initiated.
 * @param transferDirection - The direction of the transfer, either ToPolkadot or ToEthereum direction.
 * @returns The progression value of the bridge transfer process, ranging between 5% and 90%.
 */
export const bridgeProgressionValue = (
  transferDate: Date,
  transferDirection: Direction,
  bridgeStatus?: SnowbridgeStatus,
) => {
  if (!bridgeStatus) return 0

  const bridgeTimestamp = // seconds converted in miliseconds
    transferDirection === Direction.ToPolkadot
      ? bridgeStatus?.polkadotBridgeStatus * 1000
      : bridgeStatus.ethBridgeStatus * 1000

  const transferTimestamp = new Date(transferDate).getTime()
  const targetTimestamp = bridgeTimestamp + transferTimestamp
  const currentTimestamp = new Date().getTime()

  if (currentTimestamp > targetTimestamp) return 90

  // time already spent between transfer start & current time
  const diffTimeSinceTransfer = currentTimestamp - transferTimestamp
  const progression = (diffTimeSinceTransfer / bridgeTimestamp) * 100

  // To avoid displaying full progression bar, keep a 10% buffer.
  // It returns 90% max and min 5% (to improve UI)
  return Math.min(progression < 5 ? 5 : progression, 90)
}
