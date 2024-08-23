import { REGISTRY } from '@/config/registry'
import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { Environment } from '@/store/environmentStore'

/** Filters all chains by compatibility for the selected destination and token. */
// TODO
export const getFilteredSourceChains = (
  env: Environment,
  _destinationChain: Chain | null,
  _token: Token | null,
) => {
  return REGISTRY[env].chains
}

/** Filters all chains by compatibility for the selected source and token. */
// TODO
export const getFilteredDestinationChains = (
  env: Environment,
  _sourceChain: Chain | null,
  _token: Token | null,
) => {
  return REGISTRY[env].chains
}

/** Filters all tokens by compatibility for the selected source and destination chain. */
// TODO
export const getFilteredTokens = (
  env: Environment,
  _sourceChain: Chain | null,
  _destinationChain: Chain | null,
) => {
  const tokens = REGISTRY[env].tokens

  return tokens
}
