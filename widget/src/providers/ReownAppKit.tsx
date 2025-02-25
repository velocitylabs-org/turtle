import { ReactNode } from 'react'
import { createAppKit } from '@reown/appkit/react'
import { WagmiProvider } from 'wagmi'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { AppKitNetwork, mainnet as ethereum, moonbeam, sepolia } from '@reown/appkit/networks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { environment, isDevelopment, projectId, vercelDomain } from '@/utils/consts'
import { Environment } from '@/stores/environments'

if (!projectId) throw new Error('Project ID is not defined')

const mainnet_networks = [ethereum, moonbeam] as [AppKitNetwork, ...AppKitNetwork[]]
const testnet_networks = [sepolia] as [AppKitNetwork, ...AppKitNetwork[]]

const vercelUrl = vercelDomain ? `https://${vercelDomain}` : ''

const queryClient = new QueryClient()

const wagmiAdapter = new WagmiAdapter({
  projectId: projectId || '',
  networks: environment === Environment.Testnet ? testnet_networks : mainnet_networks,
})

const wagmiAdapterConfig = wagmiAdapter.wagmiConfig

const metadata = {
  name: 'turtle-app',
  description: 'Token transfers done right',
  url: isDevelopment ? 'http://localhost:3000' : vercelUrl, // domain must be allowed in WalletConnect Cloud
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
}

const generalConfig = {
  networks: environment === Environment.Testnet ? testnet_networks : mainnet_networks,
  defaultNetwork: environment === Environment.Testnet ? sepolia : ethereum,
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

function ReownProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapterConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

export default ReownProvider
