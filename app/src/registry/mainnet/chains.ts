import { DWELLIR_KEY } from '@/config'
import { Chain } from '@/models/chain'

export const Ethereum: Chain = {
  uid: 'ethereum',
  name: 'Ethereum',
  logoURI: '/logos/ethereum.svg',
  chainId: 1,
  network: 'Ethereum',
  walletType: 'EVM',
  supportedAddressTypes: ['evm'],
}

export const AssetHub: Chain = {
  uid: 'polkadot-assethub',
  name: 'Asset Hub',
  logoURI: '/logos/assethub.svg',
  chainId: 1000,
  network: 'Polkadot',
  supportedAddressTypes: ['ss58'],
  walletType: 'Substrate',
  rpcConnection: `wss://api-asset-hub-polkadot.dwellir.com/${DWELLIR_KEY}`,
}

export const RelayChain: Chain = {
  uid: 'polkadot',
  name: 'Polkadot',
  logoURI: '/logos/polkadot.svg',
  chainId: 0,
  network: 'Polkadot',
  supportedAddressTypes: ['ss58'],
  walletType: 'Substrate',
  rpcConnection: `wss://api-polkadot.n.dwellir.com/${DWELLIR_KEY}`,
}

export const BridgeHub: Chain = {
  uid: 'polkadot-bridgehub',
  name: 'Bridge Hub',
  logoURI: '/logos/bridgehub.svg',
  chainId: 1002,
  network: 'Polkadot',
  supportedAddressTypes: ['ss58'],
  walletType: 'Substrate',
  rpcConnection: `wss://api-bridge-hub-polkadot.dwellir.com/${DWELLIR_KEY}`,
}

export const Bifrost: Chain = {
  uid: 'bifrost',
  name: 'Bifrost',
  logoURI: '/logos/bifrost.svg',
  chainId: 2030,
  destinationFeeDOT: '385000000',
  network: 'Polkadot',
  supportedAddressTypes: ['ss58'],
  walletType: 'Substrate',
  rpcConnection: `wss://api-bifrost-polkadot.dwellir.com/${DWELLIR_KEY}`,
}

export const Hydration: Chain = {
  uid: 'hydration',
  name: 'Hydration',
  logoURI: '/logos/hydra.svg',
  chainId: 2034,
  destinationFeeDOT: '3774400',
  network: 'Polkadot',
  supportedAddressTypes: ['ss58'],
  walletType: 'Substrate',
  rpcConnection: `wss://api-hydradx.dwellir.com/${DWELLIR_KEY}`,
}

export const Phala: Chain = {
  uid: 'phala',
  name: 'Phala',
  logoURI: '/logos/phala.svg',
  chainId: 2035,
  network: 'Polkadot',
  supportedAddressTypes: ['ss58'],
  walletType: 'Substrate',
  rpcConnection: `wss://api-phala.dwellir.com/${DWELLIR_KEY}`,
}

export const Moonbeam: Chain = {
  uid: 'moonbeam',
  name: 'Moonbeam',
  logoURI: '/logos/moonbeam.svg',
  chainId: 2004,
  destinationFeeDOT: '313592650',
  network: 'Polkadot',
  supportedAddressTypes: ['evm'],
  walletType: 'EVM',
  rpcConnection: `wss://api-moonbeam.n.dwellir.com/${DWELLIR_KEY}`,
}

export const Interlay: Chain = {
  uid: 'interlay',
  name: 'Interlay',
  logoURI: '/logos/interlay.svg',
  chainId: 2032,
  destinationFeeDOT: '', // TODO
  network: 'Polkadot',
  supportedAddressTypes: ['ss58'],
  walletType: 'Substrate',
  rpcConnection: `wss://api-interlay.dwellir.com/${DWELLIR_KEY}`,
}

export const Acala: Chain = {
  uid: 'acala',
  name: 'Acala',
  logoURI: '/logos/acala.svg',
  chainId: 2000,
  destinationFeeDOT: '', // TODO
  network: 'Polkadot',
  supportedAddressTypes: ['ss58'],
  walletType: 'Substrate',
  rpcConnection: `wss://api-acala.dwellir.com/${DWELLIR_KEY}`,
}

export const Polimec: Chain = {
  uid: 'polimec',
  name: 'Polimec',
  logoURI: '/logos/polimec.svg',
  chainId: 3344,
  destinationFeeDOT: '', // TODO
  network: 'Polkadot',
  supportedAddressTypes: ['ss58'],
  walletType: 'Substrate',
  rpcConnection: `wss://api-polimec.n.dwellir.com/${DWELLIR_KEY}`,
}

export const Centrifuge: Chain = {
  uid: 'centrifuge',
  name: 'Centrifuge',
  logoURI: '/logos/cfg.svg',
  chainId: 2031,
  destinationFeeDOT: '', // TODO
  network: 'Polkadot',
  supportedAddressTypes: ['ss58'],
  walletType: 'Substrate',
  rpcConnection: `wss://api-centrifuge.dwellir.com/${DWELLIR_KEY}`,
}

export const Astar: Chain = {
  uid: 'astar',
  name: 'Astar',
  logoURI: '/logos/astar.svg',
  chainId: 2006,
  destinationFeeDOT: '', // TODO
  network: 'Polkadot',
  supportedAddressTypes: ['ss58'],
  walletType: 'Substrate',
  rpcConnection: `wss://api-astar.dwellir.com/${DWELLIR_KEY}`,
}

export const Mythos: Chain = {
  uid: 'mythos',
  name: 'Mythos',
  logoURI: '/logos/myth.svg',
  chainId: 3369,
  destinationFeeDOT: '500000000',
  network: 'Polkadot',
  supportedAddressTypes: ['evm'],
  walletType: 'SubstrateEVM',
  rpcConnection: 'wss://polkadot-mythos-rpc.polkadot.io',
}
