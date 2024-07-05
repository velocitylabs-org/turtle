import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'

import { cookieStorage, createStorage } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

// Get projectId at https://cloud.walletconnect.com
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
if (!projectId) throw new Error('Project ID is not defined')

const isDevelopmentMode = process.env.NODE_ENV === 'development'
const shouldUseTestnet = isDevelopmentMode || process.env.VERCEL_ENV === 'preview'

const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : ''

const metadata = {
  name: 'Turtle',
  description: 'Token transfers done right',
  url: isDevelopmentMode ? 'http://localhost:3000' : vercelUrl, // domain must be allowed in WalletConnect Cloud
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
}

const chainsTestnet = [sepolia] as const
const chainsMainnet = [mainnet] as const

// Create wagmiConfig
export const config = defaultWagmiConfig({
  chains: shouldUseTestnet ? chainsTestnet : chainsMainnet,
  projectId,
  metadata,
  ssr: true,
  enableEmail: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  // ...wagmiOptions, // Optional - Override createConfig parameters
})
