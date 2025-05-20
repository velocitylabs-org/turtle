import { Chain, Token, REGISTRY, Ethereum, RelayChain } from '@velocitylabs-org/turtle-registry'

export const primaryColor = '#00FF29'

export const loadingBarOpt = {
  color: primaryColor,
  height: 3,
  waitingTime: 200,
}

// Chains
export const chains = REGISTRY.mainnet.chains
export const ethereumChain = Ethereum
export const relayChain = RelayChain
export const chainsByUid = chains.reduce<Record<string, Chain>>((acc, chain) => {
  acc[chain.uid] = chain
  return acc
}, {})

// Tokens
export const tokens = REGISTRY.mainnet.tokens
export const tokensById = tokens.reduce<Record<string, Token>>((acc, token) => {
  acc[token.id] = token
  return acc
}, {})
