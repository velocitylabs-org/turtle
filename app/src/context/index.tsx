'use client'
import { config } from '@/config'
import { projectId } from '@/utils/env'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { ReactNode } from 'react'
import { State, WagmiProvider } from 'wagmi'
import { colors } from '../../tailwind.config'

// Setup queryClient
const queryClient = new QueryClient()
if (!projectId) throw new Error('Project ID is not defined')

// Create modal
export const wallet = createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true,
  enableOnramp: true,
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent': colors['turtle-primary'],
  },
})

export default function Web3ModalProvider({
  children,
  initialState,
}: {
  children: ReactNode
  initialState?: State
}) {
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
