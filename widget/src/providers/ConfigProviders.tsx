import { Chain, Token } from '@velocitylabs-org/turtle-registry'
import { createContext } from 'react'

export const ConfigContext = createContext<{
  allowedChains: Chain['uid'][] | undefined
  allowedTokens: Token['id'][] | undefined
}>({
  allowedChains: [],
  allowedTokens: [],
})

export const ConfigProvider = ({
  allowedChains,
  allowedTokens,
  children,
}: {
  allowedChains?: Chain['uid'][]
  allowedTokens?: Token['id'][]
  children: React.ReactNode
}) => {
  return (
    <ConfigContext.Provider value={{ allowedChains, allowedTokens }}>
      {children}
    </ConfigContext.Provider>
  )
}
