import { environment } from '@/utils/consts'
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
  current: environment === Environment.Testnet ? Environment.Testnet : Environment.Mainnet,

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
