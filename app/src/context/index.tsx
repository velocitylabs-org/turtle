'use client'
import { Environment } from '@/store/environmentStore'
import { isDevelopment, projectId, vercelDomain } from '@/utils/env'
import { createAppKit } from '@reown/appkit'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, sepolia } from '@reown/appkit/networks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { WagmiConfig } from 'wagmi'

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

export const wagmiAdapter = new WagmiAdapter({
  networks: process.env.NEXT_PUBLIC_ENVIRONMENT === Environment.Testnet ? [sepolia] : [mainnet],
  projectId,
})

// Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks: process.env.NEXT_PUBLIC_ENVIRONMENT === Environment.Testnet ? [sepolia] : [mainnet],
  metadata: metadata,
  projectId,
  features: {
    analytics: true,
  },
})
/* export const wallet = createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true,
  enableOnramp: true,
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent': colors['turtle-primary'],
  },
}) */

export default function ReownProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiConfig config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiConfig>
  )
}
