import * as Snowbridge from '@snowbridge/api'

export function getEnvironment(network: string): Snowbridge.environment.SnowbridgeEnvironment {
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
      execution_url: config.ETHEREUM_WS_API('3Abd1KfeBZgvuM0YSAkoIwGRCC26z5lw'),
      beacon_url: config.BEACON_HTTP_API,
    },
    polkadot: {
      url: {
        bridgeHub: config.BRIDGE_HUB_WS_URL,
        assetHub: config.ASSET_HUB_WS_URL,
        relaychain: config.RELAY_CHAIN_WS_URL,
        parachains: config.PARACHAINS,
      },
    },
    appContracts: {
      gateway: config.GATEWAY_CONTRACT,
      beefy: config.BEEFY_CONTRACT,
    },
  })
}
