import type { Chain, Token } from '@velocitylabs-org/turtle-registry'
import { createContext } from 'react'

export interface ConfigRegistryType {
  chains: Chain['uid'][]
  tokens: Token['id'][]
}

export const ConfigContext = createContext<{
  allowedChains: Chain['uid'][]
  allowedTokens: Token['id'][]
  endpointUrl: string
}>({
  allowedChains: [],
  allowedTokens: [],
  endpointUrl: '',
})

globalThis.ENDPOINT_URL = ''

export const ConfigProvider = ({
  registry,
  endpointUrl,
  children,
}: {
  registry: ConfigRegistryType
  endpointUrl: string
  children: React.ReactNode
}) => {
  const { chains: allowedChains, tokens: allowedTokens } = registry

  globalThis.ENDPOINT_URL = endpointUrl

  return (
    <ConfigContext.Provider value={{ allowedChains, allowedTokens, endpointUrl }}>{children}</ConfigContext.Provider>
  )
}
