import { create } from 'zustand'

export enum Environment {
  /* Polkadot - Ethereum */
  Mainnet = 'mainnet',
  /* Rococo - Sepolia */
  Testnet = 'testnet',
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

export function environmentFromStr(str: string): Environment | undefined {
  switch (str.toLowerCase()) {
    case 'mainnet':
      return Environment.Mainnet
    case 'testnet':
      return Environment.Testnet
    default:
      return
  }
}
