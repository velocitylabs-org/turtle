import { Environment } from '@/store/environmentStore'
import { isDevelopment, projectId, vercelDomain } from '@/utils/env'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { cookieStorage, createStorage } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

// Get projectId at https://cloud.walletconnect.com
if (!projectId) throw new Error('Project ID is not defined')

const vercelUrl = vercelDomain ? `https://${vercelDomain}` : ''

const metadata = {
  name: 'turtle-app',
  description: 'Token transfers done right',
  url: isDevelopment ? 'http://localhost:3000' : vercelUrl, // domain must be allowed in WalletConnect Cloud
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
}

const chainsTestnet = [sepolia] as const
const chainsMainnet = [mainnet] as const

// Create wagmiConfig
export const config = defaultWagmiConfig({
  chains:
    process.env.NEXT_PUBLIC_ENVIRONMENT === Environment.Testnet ? chainsTestnet : chainsMainnet, // TODO: Figure out how to access environment state here once needed.
  projectId,
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  // ...wagmiOptions, // Optional - Override createConfig parameters
})
