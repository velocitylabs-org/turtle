/* eslint-disable @typescript-eslint/no-namespace */
import { Chain, Network } from '@/models/chain'
import { Token } from '@/models/token'

/* Mainnet :: Polkadot - Ethereum */
export namespace Mainnet {
  export const Ethereum: Chain = {
    uid: 'ethereum',
    name: 'Ethereum',
    logoURI:
      'https://cloudfront-us-east-1.images.arcpublishing.com/coindesk/ZJZZK5B2ZNF25LYQHMUTBTOMLU.png',
    chainId: 1,
    network: Network.Ethereum,
  }

  export const AssetHub: Chain = {
    uid: 'polkadot-assethub',
    name: 'Polkadot Asset Hub',
    logoURI: 'https://cnews24.ru/uploads/d41/d419a4c7028eaf6864f972e554d761e7b10e5d06.png',
    chainId: 1000,
    network: Network.Polkadot,
  }

  export const Moonbeam: Chain = {
    uid: 'moonbeam',
    name: 'Moonbeam',
    logoURI: 'https://cnews24.ru/uploads/d41/d419a4c7028eaf6864f972e554d761e7b10e5d06.png',
    chainId: 2004,
    network: Network.Polkadot,
  }

  /*   export const Mythos: Chain = {
    uid: 'mythos',
    name: 'Mythos',
    logoURI: 'https://cnews24.ru/uploads/d41/d419a4c7028eaf6864f972e554d761e7b10e5d06.png',
    chainId: 3369,
    network: Network.Polkadot,
  } */

  export const WETH: Token = {
    id: 'weth',
    name: 'Wrapped Ether',
    symbol: 'wETH',
    logoURI: 'https://ucarecdn.com/c01c9021-a497-41b5-8597-9ab4e71440c1/wrapped-eth.png',
    decimals: 18,
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  }

  export const VETH: Token = {
    id: 'veth',
    name: 'Venus ETH',
    symbol: 'vETH',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7963.png',
    decimals: 18,
    address: '0xc3d088842dcf02c13699f936bb83dfbbc6f721ab',
  }

  export const WBTC: Token = {
    id: 'wbtc',
    name: 'Wrapped Bitcoin',
    symbol: 'WBTC',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3717.png',
    decimals: 8,
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  }

  export const SHIB: Token = {
    id: 'shib',
    name: 'Shiba Inu',
    symbol: 'SHIB',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5994.png',
    decimals: 18,
    address: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce',
  }

  export const PEPE: Token = {
    id: 'pepe',
    name: 'Pepe',
    symbol: 'PEPE',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/24478.png',
    decimals: 18,
    address: '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
  }

  export const TON: Token = {
    id: 'ton',
    name: 'Toncoin',
    symbol: 'TON',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png',
    decimals: 9,
    address: '0x582d872a1b094fc48f5de31d3b73f2d9be47def1',
  }

  export const WSTETH: Token = {
    id: 'wsteth',
    name: 'Lido wstETH',
    symbol: 'WSTETH',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/12409.png',
    decimals: 18,
    address: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
  }

  export const TBTC: Token = {
    id: 'tbtc',
    name: 'tBTC',
    symbol: 'TBTC',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5776.png',
    decimals: 18,
    address: '0x18084fbA666a33d37592fA2633fD49a74DD93a88',
  }

  export const USDT: Token = {
    id: 'usdt',
    name: 'Tether',
    symbol: 'USDT',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
    decimals: 6,
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  }

  export const USDC: Token = {
    id: 'usdc',
    name: 'USDC',
    symbol: 'USDC',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
    decimals: 6,
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  }

  export const DAI: Token = {
    id: 'dai',
    name: 'DAI',
    symbol: 'DAI',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4943.png',
    decimals: 18,
    address: '0x6b175474e89094c44da98b954eedeac495271d0f',
  }

  export const DOT: Token = {
    id: 'dot',
    name: 'Polkadot',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/6636.png',
    symbol: 'DOT',
    decimals: 10,
    address: '',
  }

  export const ETH: Token = {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
    decimals: 18,
    address: '',
  }
}

/* Testnet :: Rococo - Sepolia */
export namespace Testnet {
  /* Mainnet :: Polkadot - Ethereum */
  export const Sepolia: Chain = {
    uid: 'sepolia',
    name: 'Sepolia',
    logoURI:
      'https://cloudfront-us-east-1.images.arcpublishing.com/coindesk/ZJZZK5B2ZNF25LYQHMUTBTOMLU.png',
    chainId: 11155111,
    network: Network.Ethereum,
  }

  export const RococoAssetHub: Chain = {
    uid: 'rococo-assethub',
    name: 'Rococo Asset Hub',
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
    address: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
  }

  export const VETH: Token = {
    id: 'veth',
    name: 'Venus ETH',
    symbol: 'vETH',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7963.png',
    decimals: 18,
    address: '0xc3d088842dcf02c13699f936bb83dfbbc6f721ab',
  }

  export const ETH: Token = {
    id: 'seth',
    name: 'Sepolia Ether',
    symbol: 'sETH',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
    decimals: 18,
    address: '',
  }

  export const ROC: Token = {
    id: 'roc',
    name: 'Rococo',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/6636.png',
    symbol: 'ROC',
    decimals: 12,
    address: '',
  }
}

export const REGISTRY = {
  mainnet: {
    chains: [Mainnet.Ethereum, Mainnet.AssetHub, Mainnet.Moonbeam],
    tokens: [
      Mainnet.WETH,
      Mainnet.WBTC,
      Mainnet.USDC,
      Mainnet.USDT,
      Mainnet.DAI,
      Mainnet.WSTETH,
      Mainnet.TBTC,
      Mainnet.TON,
      Mainnet.SHIB,
      Mainnet.PEPE,
    ],
  },
  testnet: {
    chains: [Testnet.Sepolia, Testnet.RococoAssetHub],
    tokens: [Testnet.WETH, Testnet.VETH],
  },
}

export function getNativeToken(chain: Chain): Token {
  switch (chain.uid) {
    case 'rococo-assethub':
      return Testnet.ROC
    case 'sepolia':
      return Testnet.ETH
    case 'polkadot-assethub':
      return Mainnet.DOT
    case 'ethereum':
      return Mainnet.ETH
    default:
      throw Error('The impossible has happened!')
  }
}
