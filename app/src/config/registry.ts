import { Chain, Network } from '@/models/chain'
import { Token } from '@/models/token'
import { Environment } from '@/store/environmentStore'
import { environment } from '@snowbridge/api'

/* Mainnet :: Polkadot - Ethereum */
export module Mainnet {
  export const Ethereum: Chain = {
    id: 'ethereum',
    name: 'Ethereum',
    logoURI:
      'https://cloudfront-us-east-1.images.arcpublishing.com/coindesk/ZJZZK5B2ZNF25LYQHMUTBTOMLU.png',
    chainId: 1,
    network: Network.Ethereum,
  }

  export const AssetHub: Chain = {
    id: 'polkadot-assethub',
    name: 'Polkadot AssetHub',
    logoURI: 'https://cnews24.ru/uploads/d41/d419a4c7028eaf6864f972e554d761e7b10e5d06.png',
    chainId: 1000,
    network: Network.Polkadot,
  }

  export const WETH: Token = {
    id: 'weth',
    name: 'Wrapped Ether',
    symbol: 'wETH',
    logoURI: 'https://ucarecdn.com/c01c9021-a497-41b5-8597-9ab4e71440c1/wrapped-eth.png',
    decimals: 18,
  }
}

/* Testnet :: Rococo - Sepolia */
export module Testnet {
  /* Mainnet :: Polkadot - Ethereum */
  export const Sepolia: Chain = {
    id: 'sepolia',
    name: 'Sepolia',
    logoURI:
      'https://cloudfront-us-east-1.images.arcpublishing.com/coindesk/ZJZZK5B2ZNF25LYQHMUTBTOMLU.png',
    chainId: 11155111,
    network: Network.Ethereum,
  }

  export const RococoAssetHub: Chain = {
    id: 'rococo-assethub',
    name: 'Rococo AssetHub',
    logoURI: 'https://cnews24.ru/uploads/d41/d419a4c7028eaf6864f972e554d761e7b10e5d06.png',
    chainId: 1000,
    network: Network.Polkadot,
  }

  export const WETH: Token = {
    id: 'weth',
    name: 'Wrapped Ether',
    symbol: 'wETH',
    logoURI: 'https://ucarecdn.com/c01c9021-a497-41b5-8597-9ab4e71440c1/wrapped-eth.png',
    decimals: 18,
  }
}

export const REGISTRY = {
  Mainnet: {
    chains: [Mainnet.Ethereum, Mainnet.AssetHub],
    tokens: [Mainnet.WETH],
  },
  Testnet: {
    chains: [Testnet.Sepolia, Testnet.RococoAssetHub],
    tokens: [Testnet.WETH],
  },
}
