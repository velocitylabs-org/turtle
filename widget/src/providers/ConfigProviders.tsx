import type { Chain, Token } from '@velocitylabs-org/turtle-registry'
import { createContext } from 'react'

export interface ConfigRegistryType {
  chains: Chain['uid'][]
  tokens: Token['id'][]
}

export const ConfigContext = createContext<{
  allowedChains: Chain['uid'][]
  allowedTokens: Token['id'][]
}>({
  allowedChains: [],
  allowedTokens: [],
})

export const ConfigProvider = ({ registry, children }: { registry: ConfigRegistryType; children: React.ReactNode }) => {
  const { chains: allowedChains, tokens: allowedTokens } = registry

  return <ConfigContext.Provider value={{ allowedChains, allowedTokens }}>{children}</ConfigContext.Provider>
}
