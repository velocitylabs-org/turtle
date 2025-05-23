import { REGISTRY, Ethereum, RelayChain } from '@velocitylabs-org/turtle-registry'

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

// Tokens
export const tokens = REGISTRY.mainnet.tokens
