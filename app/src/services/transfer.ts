import { Chain } from '../models/chain'
import { Token } from '../models/token'
import * as Snowbridge from '@snowbridge/api'

/**
 * The direction of a transfer, i.e, from and to which network the tokens
 * will be sent.
 *
 */
export enum Direction {
  ToEthereum,
  ToPolkadot,
  WithinPolkadot,
}

export const resolveDirection = (source: Chain, destination: Chain): Direction => {
  if (source.id == 'ethereum') return Direction.ToPolkadot
  if (destination.id == 'ethereum') return Direction.ToEthereum

  return Direction.WithinPolkadot
}

export const doTransfer = async (
  sourceChain: Chain,
  token: Token,
  amount: number,
  destinationChain: Chain,
): Promise<void> => {
  console.log(
    'Transfer {} {} from {} to on {}',
    token.id,
    amount,
    sourceChain.name,
    destinationChain.id,
  )

  let direction = resolveDirection(sourceChain, destinationChain)
  // 1. Snowbridge.toEthereum.validateSend
  // 2. Snowbridge.toEthereum.send

  const snwobridgeEnv = Snowbridge.environment.SNOWBRIDGE_ENV['rococo_sepolia']
  if (snwobridgeEnv === undefined) {
    throw Error(`Unknown environment`)
  }

  const { config } = snwobridgeEnv

  const context = await Snowbridge.contextFactory({
    ethereum: {
      //TODO(nuno): Get infura key for our needs
      execution_url: config.ETHEREUM_WS_API(process.env.TURTLE_APP_INFURA_KEY || ''),
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

  switch (direction) {
    case Direction.ToEthereum: {
      console.log('ToEthereum')
      break
    }
    case Direction.ToPolkadot: {
      console.log('ToPolkadot')
      break
    }
    case Direction.WithinPolkadot: {
      throw new Error('Polkadot internal transfers are not supported')
    }
  }
}
