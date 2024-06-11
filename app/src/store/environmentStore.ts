import { create } from 'zustand'

export enum Environment {
  /* Polkadot - Ethereum */
  Mainnet = 'Mainnet',
  /* Rococo - Sepolia */
  Testnet = 'Testnet',
}

interface State {
  // State
  current: Environment

  // Actions
  switchTo: (environment: Environment) => void
}

export const useEnvironmentStore = create<State>(set => ({
  // State
  current: Environment.Testnet,

  // Actions
  switchTo: environment =>
    set(_ => ({
      current: environment,
    })),
}))
