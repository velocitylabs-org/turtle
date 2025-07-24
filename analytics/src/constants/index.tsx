import { Ethereum, Polkadot, REGISTRY } from '@velocitylabs-org/turtle-registry'

export const primaryColor = '#00FF29'

export const loadingBarOpt = {
  color: primaryColor,
  height: 4,
  waitingTime: 200,
}

export const defaultTransactionLimit = 20

// Chains
export const chains = REGISTRY.mainnet.chains
export const ethereumChain = Ethereum
export const relayChain = Polkadot

// Tokens
export const tokens = REGISTRY.mainnet.tokens

export type GraphType = 'volume' | 'count'

export type TimePeriodType = 'last-6-months' | 'last-month' | 'this-week'

export const swapsStartingDate = new Date('2023-04-29')

export const statusColors = {
  succeeded: { hex: '#22c55e', className: 'green-500' },
  failed: { hex: '#ef4444', className: 'red-500' },
  undefined: { hex: '#eab308', className: 'yellow-500' },
}
