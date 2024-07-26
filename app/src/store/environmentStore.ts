import { isDevelopment, isPreview } from '@/utils/env'
import { create } from 'zustand'

export enum Environment {
  /* Polkadot - Ethereum */
  Mainnet = 'mainnet',
  /* Rococo - Sepolia */
  Testnet = 'testnet',
}
export const shouldUseTestnet = isDevelopment || isPreview
export const currentEnvironement = shouldUseTestnet ? Environment.Testnet : Environment.Mainnet

interface State {
  // State
  current: Environment

  // Actions
  switchTo: (environment: Environment) => void
}

export const useEnvironmentStore = create<State>(set => ({
  // State
  current: currentEnvironement,

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
