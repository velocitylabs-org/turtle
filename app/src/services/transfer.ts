import { Chain } from '@velocitylabs-org/turtle-registry'

/**
 * The direction of a transfer, i.e, from and to which network the tokens
 * will be sent.
 *
 */
export enum Direction {
  ToEthereum = 'ToEthereum',
  ToPolkadot = 'toPolkadot',
  WithinPolkadot = 'WithinPolkadot',
  WithinEthereum = 'WithinEthereum',
}

/**
 * Resolve the direction of a transfer given the source and destination chains.
 */
export const resolveDirection = (source: Chain, destination: Chain): Direction => {
  if (source.network == 'Ethereum' && destination.network == 'Polkadot') return Direction.ToPolkadot
  if (source.network == 'Polkadot' && destination.network == 'Ethereum') return Direction.ToEthereum
  if (source.network == 'Ethereum' && destination.network == 'Ethereum')
    return Direction.WithinEthereum
  if (source.network == 'Polkadot' && destination.network == 'Polkadot')
    return Direction.WithinPolkadot

  throw Error('The impossible happened')
}
