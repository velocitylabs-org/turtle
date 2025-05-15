import AcalaLogo from '@/assets/logos/acala.svg'
import AssetHubLogo from '@/assets/logos/assethub.svg'
import AstarLogo from '@/assets/logos/astar.svg'
import BifrostLogo from '@/assets/logos/bifrost.svg'
import BridgeHubLogo from '@/assets/logos/bridgehub.svg'
import CentrifugeLogo from '@/assets/logos/cfg.svg'
import EthereumLogo from '@/assets/logos/ethereum.svg'
import HydrationLogo from '@/assets/logos/hydra.svg'
import InterlayLogo from '@/assets/logos/interlay.svg'
import MoonbeamLogo from '@/assets/logos/moonbeam.svg'
import MythosLogo from '@/assets/logos/myth.svg'
import PhalaLogo from '@/assets/logos/phala.svg'
import PolimecLogo from '@/assets/logos/polimec.svg'
import RelayChainLogo from '@/assets/logos/polkadot.svg'
import { Chain } from '@/models/chain'
import { DWELLIR_KEY } from '@/utils/consts'

export const Acala: Chain = {
  uid: 'acala',
  name: 'Acala',
  logoURI: AcalaLogo,
  chainId: 2000,
  destinationFeeDOT: '', // TODO
  network: 'Polkadot',
  supportedAddressTypes: ['ss58'],
  walletType: 'Substrate',
  rpcConnection: `wss://api-acala.dwellir.com/${DWELLIR_KEY}`,
}

export const AssetHub: Chain = {
  uid: 'polkadot-assethub',
  name: 'Asset Hub',
  logoURI: AssetHubLogo,
  chainId: 1000,
  network: 'Polkadot',
  supportedAddressTypes: ['ss58'],
  walletType: 'Substrate',
  rpcConnection: `wss://api-asset-hub-polkadot.dwellir.com/${DWELLIR_KEY}`,
}

export const Astar: Chain = {
  uid: 'astar',
  name: 'Astar',
  logoURI: AstarLogo,
  chainId: 2006,
  destinationFeeDOT: '', // TODO
  network: 'Polkadot',
  supportedAddressTypes: ['ss58'],
  walletType: 'Substrate',
  rpcConnection: `wss://api-astar.dwellir.com/${DWELLIR_KEY}`,
}

export const Bifrost: Chain = {
  uid: 'bifrost',
  name: 'Bifrost',
  logoURI: BifrostLogo,
  chainId: 2030,
  destinationFeeDOT: '20000000',
  network: 'Polkadot',
  supportedAddressTypes: ['ss58'],
  walletType: 'Substrate',
  rpcConnection: `wss://api-bifrost-polkadot.dwellir.com/${DWELLIR_KEY}`,
}

export const BridgeHub: Chain = {
  uid: 'polkadot-bridgehub',
  name: 'Bridge Hub',
  logoURI: BridgeHubLogo,
  chainId: 1002,
  network: 'Polkadot',
  supportedAddressTypes: ['ss58'],
  walletType: 'Substrate',
  rpcConnection: `wss://api-bridge-hub-polkadot.dwellir.com/${DWELLIR_KEY}`,
}

export const Centrifuge: Chain = {
  uid: 'centrifuge',
  name: 'Centrifuge',
  logoURI: CentrifugeLogo,
  chainId: 2031,
  destinationFeeDOT: '', // TODO
  network: 'Polkadot',
  supportedAddressTypes: ['ss58'],
  walletType: 'Substrate',
  rpcConnection: `wss://api-centrifuge.dwellir.com/${DWELLIR_KEY}`,
}

export const Ethereum: Chain = {
  uid: 'ethereum',
  name: 'Ethereum',
  logoURI: EthereumLogo,
  chainId: 1,
  network: 'Ethereum',
  walletType: 'EVM',
  supportedAddressTypes: ['evm'],
}

export const Hydration: Chain = {
  uid: 'hydration',
  name: 'Hydration',
  logoURI: HydrationLogo,
  chainId: 2034,
  destinationFeeDOT: '20000000',
  network: 'Polkadot',
  supportedAddressTypes: ['ss58'],
  walletType: 'Substrate',
  rpcConnection: `wss://api-hydradx.dwellir.com/${DWELLIR_KEY}`,
}

export const Interlay: Chain = {
  uid: 'interlay',
  name: 'Interlay',
  logoURI: InterlayLogo,
  chainId: 2032,
  destinationFeeDOT: '', // TODO
  network: 'Polkadot',
  supportedAddressTypes: ['ss58'],
  walletType: 'Substrate',
  rpcConnection: `wss://api-interlay.dwellir.com/${DWELLIR_KEY}`,
}

export const Moonbeam: Chain = {
  uid: 'moonbeam',
  name: 'Moonbeam',
  logoURI: MoonbeamLogo,
  chainId: 2004,
  destinationFeeDOT: '500000000',
  network: 'Polkadot',
  supportedAddressTypes: ['evm'],
  walletType: 'EVM',
  rpcConnection: `wss://api-moonbeam.n.dwellir.com/${DWELLIR_KEY}`,
}

export const Mythos: Chain = {
  uid: 'mythos',
  name: 'Mythos',
  logoURI: MythosLogo,
  chainId: 3369,
  destinationFeeDOT: '500000000',
  network: 'Polkadot',
  supportedAddressTypes: ['evm'],
  walletType: 'SubstrateEVM',
  rpcConnection: 'wss://polkadot-mythos-rpc.polkadot.io',
}

export const Phala: Chain = {
  uid: 'phala',
  name: 'Phala',
  logoURI: PhalaLogo,
  chainId: 2035,
  network: 'Polkadot',
  supportedAddressTypes: ['ss58'],
  walletType: 'Substrate',
  rpcConnection: `wss://api-phala.dwellir.com/${DWELLIR_KEY}`,
}

export const Polimec: Chain = {
  uid: 'polimec',
  name: 'Polimec',
  logoURI: PolimecLogo,
  chainId: 3344,
  destinationFeeDOT: '', // TODO
  network: 'Polkadot',
  supportedAddressTypes: ['ss58'],
  walletType: 'Substrate',
  rpcConnection: `wss://api-polimec.n.dwellir.com/${DWELLIR_KEY}`,
}

export const RelayChain: Chain = {
  uid: 'polkadot',
  name: 'Polkadot',
  logoURI: RelayChainLogo,
  chainId: 0,
  network: 'Polkadot',
  supportedAddressTypes: ['ss58'],
  walletType: 'Substrate',
  rpcConnection: `wss://api-polkadot.n.dwellir.com/${DWELLIR_KEY}`,
}
