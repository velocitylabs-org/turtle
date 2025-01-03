'use client'
import { wagmiAdapter } from '@/config'
import { Environment } from '@/store/environmentStore'
import { isDevelopment, projectId, vercelDomain } from '@/utils/env'
import { mainnet, moonbeam, sepolia } from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { Config, cookieToInitialState, WagmiProvider } from 'wagmi'

// Setup queryClient
export const queryClient = new QueryClient()
if (!projectId) throw new Error('Project ID is not defined')

// Get projectId at https://cloud.walletconnect.com
if (!projectId) throw new Error('Project ID is not defined')

const vercelUrl = vercelDomain ? `https://${vercelDomain}` : ''
export const DWELLIR_KEY = process.env.NEXT_PUBLIC_DWELLIR_KEY

const metadata = {
  name: 'turtle-app',
  description: 'Token transfers done right',
  url: isDevelopment ? 'http://localhost:3000' : vercelUrl, // domain must be allowed in WalletConnect Cloud
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
}

// Create modal
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks:
    process.env.NEXT_PUBLIC_ENVIRONMENT === Environment.Testnet ? [sepolia] : [mainnet, moonbeam],
  defaultNetwork: process.env.NEXT_PUBLIC_ENVIRONMENT === Environment.Testnet ? sepolia : mainnet,
  metadata: metadata,
  projectId,
  themeMode: 'light',
  features: {
    analytics: true,
  },
})

function ContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

export default ContextProvider
