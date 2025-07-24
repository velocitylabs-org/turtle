import { mainnet as ethereum } from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import { isDevelopment, projectId, vercelDomain } from '@/utils/consts'
import { mainnet_networks, wagmiAdapter, wagmiConfig } from './config'

if (!projectId) throw new Error('Project ID is not defined')

const vercelUrl = vercelDomain ? `https://${vercelDomain}` : ''

const queryClient = new QueryClient()

const metadata = {
  name: 'turtle-app',
  description: 'Token transfers done right',
  url: isDevelopment ? 'http://localhost:3000' : vercelUrl, // domain must be allowed in WalletConnect Cloud
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
}

const generalConfig = {
  networks: mainnet_networks,
  defaultNetwork: ethereum,
  allowUnsupportedChain: false,
  metadata: metadata,
  projectId,
  themeMode: 'light' as const,
  allWallets: 'HIDE' as const,
}

// Create modal
createAppKit({
  adapters: [wagmiAdapter],
  ...generalConfig,
  features: {
    analytics: true,
    email: false,
    socials: false,
  },
})

export default function ReownProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
