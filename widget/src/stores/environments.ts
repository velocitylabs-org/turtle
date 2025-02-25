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
  current:
    process.env.NEXT_PUBLIC_ENVIRONMENT === Environment.Testnet
      ? Environment.Testnet
      : Environment.Mainnet,

  // Actions
  switchTo: environment =>
    set(() => ({
      current: environment,
    })),
}))

export function environmentFromStr(str: string): Environment {
  switch (str.toLowerCase()) {
    case 'mainnet':
      return Environment.Mainnet
    case 'testnet':
      return Environment.Testnet
    default:
      return Environment.Mainnet
  }
}
