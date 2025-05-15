import { AppKitNetwork, mainnet as ethereum, moonbeam } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { cookieStorage, createStorage } from '@wagmi/core'
import { projectId } from '@/utils/env'

export const mainnet_networks = [ethereum, moonbeam] as [AppKitNetwork, ...AppKitNetwork[]]

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId: projectId || '',
  networks: mainnet_networks,
})

export const config = wagmiAdapter.wagmiConfig

// The minimum threeshold of what we consider a transfer worth doing
// when comparing the transfer amount to the fees involved. It's up
// to the user to decide anyways.
export const AMOUNT_VS_FEE_RATIO: number = 10
