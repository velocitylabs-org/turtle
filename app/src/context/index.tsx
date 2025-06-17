'use client'
import { mainnet as ethereum } from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { Config, cookieToInitialState, WagmiProvider } from 'wagmi'
import { mainnet_networks, wagmiAdapter } from '@/config'
import { isDevelopment, projectId, vercelDomain } from '@/utils/env'

// Setup queryClient
export const queryClient = new QueryClient()

console.log('queryClient', queryClient)

// Get projectId at https://cloud.walletconnect.com
if (!projectId) throw new Error('Project ID is not defined')

const vercelUrl = vercelDomain ? `https://${vercelDomain}` : ''

const metadata = {
  name: 'turtle-app',
  description: 'Token transfers done right',
  url: isDevelopment ? 'http://localhost:3000' : vercelUrl, // domain must be allowed in WalletConnect Cloud
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
}

// Create modal
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: mainnet_networks,
  defaultNetwork: ethereum,
  allowUnsupportedChain: false,
  metadata: metadata,
  projectId,
  themeMode: 'light',
  features: {
    analytics: true,
  },
})

interface ContextProviderProps {
  children: ReactNode
  cookies: string | null
}

export default function ContextProvider({ children, cookies }: ContextProviderProps) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
