import { REGISTRY } from '@/config/registry'
import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { Environment } from '@/store/environmentStore'

/** Filters all chains by compatibility for the selected destination and token. */
// TODO: include Token
export const getFilteredSourceChains = (
  env: Environment,
  destinationChain: Chain | null,
  _token: Token | null,
) => {
  const sourceChains = destinationChain
    ? REGISTRY[env].chains.filter(chain => chain.transferableTo.includes(destinationChain.uid))
    : REGISTRY[env].chains.filter(chain => chain.transferableTo.length > 0)

  return sourceChains
}

/** Filters all chains by compatibility for the selected source and token. */
// TODO: include Token
export const getFilteredDestinationChains = (
  env: Environment,
  sourceChain: Chain | null,
  _token: Token | null,
) => {
  const destinationChains = sourceChain
    ? sourceChain.transferableTo.map(uid => REGISTRY[env].chains.find(chain => chain.uid === uid)!)
    : REGISTRY[env].chains

  return destinationChains
}

/** Filters all tokens by compatibility for the selected source and destination chain. */
// TODO: include source chain
export const getFilteredTokens = (
  env: Environment,
  _sourceChain: Chain | null,
  destinationChain: Chain | null,
) => {
  const tokens = destinationChain ? destinationChain.receivableTokens : REGISTRY[env].tokens

  return tokens
}
