import { create } from 'zustand'

export enum Environment {
  /* Polkadot - Ethereum */
  Mainnet = 'mainnet',
}
interface State {
  // State
  current: Environment

  // Actions
  switchTo: (environment: Environment) => void
}

export const useEnvironmentStore = create<State>(set => ({
  // State
  current: Environment.Mainnet,

  // Actions
  switchTo: environment =>
    set(_ => ({
      current: environment,
    })),
}))

export function environmentFromStr(str: string): Environment {
  switch (str.toLowerCase()) {
    case 'mainnet':
      return Environment.Mainnet
    default:
      return Environment.Mainnet
  }
}
