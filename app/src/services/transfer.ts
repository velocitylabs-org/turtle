import { Chain, Network } from '../models/chain'

/**
 * The direction of a transfer, i.e, from and to which network the tokens
 * will be sent.
 *
 */
export enum Direction {
  ToEthereum = 'ToThereum',
  ToPolkadot = 'toPolkadot',
  WithinPolkadot = 'WithinPolkadot',
  WithinEthereum = 'WithinEthereum',
}

/**
 * Resolve the direction of a transfer given the source and destination chains.
 */
export const resolveDirection = (source: Chain, destination: Chain): Direction => {
  if (source.network == Network.Ethereum && destination.network == Network.Polkadot)
    return Direction.ToPolkadot
  if (source.network == Network.Polkadot && destination.network == Network.Ethereum)
    return Direction.ToEthereum
  if (source.network == Network.Ethereum && destination.network == Network.Ethereum)
    return Direction.WithinEthereum
  if (source.network == Network.Polkadot && destination.network == Network.Polkadot)
    return Direction.WithinPolkadot

  throw Error('The impossible happened')
}
