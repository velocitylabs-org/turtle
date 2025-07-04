import { REGISTRY, Ethereum, RelayChain } from '@velocitylabs-org/turtle-registry'

export const primaryColor = '#00FF29'

export const loadingBarOpt = {
  color: primaryColor,
  height: 4,
  waitingTime: 200,
}

export const defaultTransactionLimit = 10

// Chains
export const chains = REGISTRY.mainnet.chains
export const ethereumChain = Ethereum
export const relayChain = RelayChain

// Tokens
export const tokens = REGISTRY.mainnet.tokens

export type GraphType = 'volume' | 'count'

export type TimePeriodType = 'last-6-months' | 'last-month' | 'this-week'
