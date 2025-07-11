import { Chain, Network } from '@velocitylabs-org/turtle-registry'

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
  const src = source.network
  const dst = destination.network

  // Ethereum -> Polkadot
  if (src == 'Ethereum' && isAnyPolkadotNetwork(dst)) 
    return Direction.ToPolkadot
  // Ethereum -> Ethereum
  if (src == 'Ethereum' && dst == 'Ethereum')
    return Direction.WithinEthereum
  // Polkadot -> Ethereum
  if (isAnyPolkadotNetwork(src) && dst == 'Ethereum') 
    return Direction.ToEthereum
  // XCM
  if (isAnyPolkadotNetwork(src) && isAnyPolkadotNetwork(dst))
    return Direction.WithinPolkadot

  throw Error('The impossible happened')
}

export function isAnyPolkadotNetwork(network: Network): boolean {
  return network === 'Polkadot' || network === 'Kusama'
}