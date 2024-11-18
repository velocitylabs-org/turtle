import { Token } from '@/models/token'
import { Registry, snowbridgeWrapped } from '.'
import { Chain } from '@/models/chain'

/* Testnet :: Rococo - Sepolia */

// Chains
const Sepolia: Chain = {
  uid: 'sepolia',
  name: 'Sepolia',
  logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
  chainId: 11155111,
  network: 'Ethereum',
  supportedAddressTypes: ['evm'],
}

const RococoAssetHub: Chain = {
  uid: 'rococo-assethub',
  name: 'Rococo Asset Hub',
  logoURI: 'https://parachains.info/images/parachains/1688559044_assethub.svg',
  chainId: 1000,
  network: 'Polkadot',
  supportedAddressTypes: ['ss58'],
  rpcConnection: 'wss://rococo-asset-hub-rpc.polkadot.io',
}

// Tokens
const WETH: Token = {
  id: 'weth.e',
  name: 'Wrapped Ether',
  symbol: 'wETH',
  logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2396.png',
  decimals: 18,
  address: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
  multilocation:
    '{"parents":"2","interior":{"X2":[{"GlobalConsensus":{"Ethereum":{"chainId":"11155111"}}},{"AccountKey20":{"network":null,"key":"0xfff9976782d46cc05630d1f6ebab18b2324d6b14"}}]}}',
  coingeckoId: 'weth',
  origin: snowbridgeWrapped(),
}

const VETH: Token = {
  id: 'veth.e',
  name: 'Venus ETH',
  symbol: 'vETH',
  logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7963.png',
  decimals: 18,
  address: '0xc3d088842dcf02c13699f936bb83dfbbc6f721ab',
  multilocation:
    '{"parents":"2","interior":{"X2":[{"GlobalConsensus":{"Ethereum":{"chainId":"11155111"}}},{"AccountKey20":{"network":null,"key":"0xc3d088842dcf02c13699f936bb83dfbbc6f721ab"}}]}}',
  origin: snowbridgeWrapped(),
}

// Assembling the testnet registry
export const REGISTRY: Registry = {
  chains: [Sepolia, RococoAssetHub],
  tokens: [WETH, VETH],
  routes: [
    {
      from: Sepolia.uid,
      to: RococoAssetHub.uid,
      tokens: [WETH.id, VETH.id],
      sdk: 'SnowbridgeApi',
    },
    {
      from: RococoAssetHub.uid,
      to: Sepolia.uid,
      tokens: [WETH.id, VETH.id],
      sdk: 'SnowbridgeApi',
    },
  ],
  assetUid: new Map(),
}
