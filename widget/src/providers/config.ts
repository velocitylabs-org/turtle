import { type AppKitNetwork, mainnet as ethereum, moonbeam } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { projectId } from '@/utils/consts'

if (!projectId) throw new Error('Project ID is not defined')

export const mainnet_networks = [ethereum, moonbeam] as [AppKitNetwork, ...AppKitNetwork[]]

export const wagmiAdapter = new WagmiAdapter({
  projectId: projectId,
  networks: mainnet_networks,
})

export const wagmiConfig = wagmiAdapter.wagmiConfig
