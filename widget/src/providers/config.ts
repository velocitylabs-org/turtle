import { Environment } from '@/stores/environmentStore'
import { environment, projectId } from '@/utils/consts'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { AppKitNetwork, mainnet as ethereum, moonbeam, sepolia } from '@reown/appkit/networks'

if (!projectId) throw new Error('Project ID is not defined')

export const mainnet_networks = [ethereum, moonbeam] as [AppKitNetwork, ...AppKitNetwork[]]
export const testnet_networks = [sepolia] as [AppKitNetwork, ...AppKitNetwork[]]

export const wagmiAdapter = new WagmiAdapter({
  projectId: projectId,
  networks: environment === Environment.Testnet ? testnet_networks : mainnet_networks,
})

export const wagmiConfig = wagmiAdapter.wagmiConfig
