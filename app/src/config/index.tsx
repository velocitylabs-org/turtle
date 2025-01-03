import { Environment } from '@/store/environmentStore'
import { projectId } from '@/utils/env'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, moonbeam, sepolia } from '@reown/appkit/networks'
import { cookieStorage, createStorage } from '@wagmi/core'

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId: projectId || '',
  networks:
    process.env.NEXT_PUBLIC_ENVIRONMENT === Environment.Testnet ? [sepolia] : [mainnet, moonbeam],
})

export const config = wagmiAdapter.wagmiConfig

export const DWELLIR_KEY = process.env.NEXT_PUBLIC_DWELLIR_KEY

// The minimum threeshold of what we consider a transfer worth doing
// when comparing the transfer amount to the fees involved. It's up
// to the user to decide anyways.
export const AMOUNT_VS_FEE_RATIO: number = 10
