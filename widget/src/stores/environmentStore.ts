import { Environment } from '@velocitylabs-org/turtle-registry'
import { create } from 'zustand'

interface State {
  // State
  current: Environment

  // Actions
  switchTo: (environment: Environment) => void
}

export const useEnvironmentStore = create<State>((set) => ({
  // State
  current: Environment.Mainnet,

  // Actions
  switchTo: (environment) =>
    set(() => ({
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
