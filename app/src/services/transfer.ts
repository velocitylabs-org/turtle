import { Chain } from '../models/chain'
import { Token } from '../models/token'

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
