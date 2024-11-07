import { Chain, Network } from '@/models/chain'
import { Token } from '@/models/token'

/* Mainnet :: Polkadot - Ethereum */
export namespace Mainnet {
  // Chains
  export const Ethereum: Chain = {
    uid: 'ethereum',
    name: 'Ethereum',
    logoURI: 'https://raw.githubusercontent.com/0xsquid/assets/main/images/webp128/tokens/eth.webp',
    chainId: 1,
    network: Network.Ethereum,
    supportedAddressTypes: ['evm'],
  }

  export const AssetHub: Chain = {
    uid: 'polkadot-assethub',
    name: 'Polkadot Asset Hub',
    logoURI: 'https://parachains.info/images/parachains/1688559044_assethub.svg',
    chainId: 1000,
    network: Network.Polkadot,
    supportedAddressTypes: ['ss58'],
    specName: 'statemint',
    rpcConnection:
      process.env.NEXT_PUBLIC_POLKADOT_ASSET_HUB_API_URL ||
      'wss://api-asset-hub-polkadot.dwellir.com',
  }

  export const Bifrost: Chain = {
    uid: 'bifrost',
    name: 'Bifrost',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/8705.png',
    chainId: 2030,
    destinationFeeDOT: '20000000',
    network: Network.Polkadot,
    supportedAddressTypes: ['ss58'],
    rpcConnection: 'wss://bifrost-polkadot.dotters.network',
    specName: 'bifrost_polkadot',
  }

  // export const Hydration: Chain = {
  //   uid: 'hydration',
  //   name: 'Hydration',
  //   logoURI: 'https://parachains.info/images/parachains/1717606865_hydration_logo.jpg',
  //   chainId: 2034,
  //   destinationFeeDOT: '', // To be confirmed
  //   network: Network.Polkadot,
  //   supportedAddressTypes: ['ss58'],
  // }

  export const Moonbeam: Chain = {
    uid: 'moonbeam',
    name: 'Moonbeam',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/6836.png',
    chainId: 2004,
    destinationFeeDOT: '500000000', // To be confirmed
    network: Network.Polkadot,
    supportedAddressTypes: ['evm'],
    rpcConnection: 'wss://wss.api.moonbeam.network',
    specName: 'moonbeam',
  }

  export const Mythos: Chain = {
    uid: 'mythos',
    name: 'Mythos',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/22125.png',
    chainId: 3369,
    destinationFeeDOT: '500000000',
    network: Network.Polkadot,
    supportedAddressTypes: ['evm'],
    rpcConnection: 'wss://polkadot-mythos-rpc.polkadot.io',
    specName: 'mythos',
  }

  // Tokens
  export const WETH: Token = {
    id: 'weth',
    name: 'Wrapped Ether',
    symbol: 'wETH',
    logoURI: 'https://static.simpleswap.io/images/currencies-logo/weth.svg',
    decimals: 18,
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    multilocation:
      '{"parents":"2","interior":{"X2":[{"GlobalConsensus":{"Ethereum":{"chainId":"1"}}},{"AccountKey20":{"network":null,"key":"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"}}]}}',
    coingeckoId: 'weth',
    origin: {
      type: 'Ethereum',
      bridge: 'Snowbridge',
    },
  }

  export const VETH: Token = {
    id: 'veth',
    name: 'Venus ETH',
    symbol: 'vETH',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7963.png',
    decimals: 18,
    address: '0xc3d088842dcf02c13699f936bb83dfbbc6f721ab',
    multilocation:
      '{"parents":"2","interior":{"X2":[{"GlobalConsensus":{"Ethereum":{"chainId":"1"}}},{"AccountKey20":{"network":null,"key":"0xc3d088842dcf02c13699f936bb83dfbbc6f721ab"}}]}}',
    origin: {
      type: 'Ethereum',
      bridge: 'Snowbridge',
    },
  }

  export const WBTC: Token = {
    id: 'wbtc',
    name: 'Wrapped Bitcoin',
    symbol: 'WBTC',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3717.png',
    decimals: 8,
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    multilocation:
      '{"parents":"2","interior":{"X2":[{"GlobalConsensus":{"Ethereum":{"chainId":"1"}}},{"AccountKey20":{"network":null,"key":"0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"}}]}}',
    origin: {
      type: 'Ethereum',
      bridge: 'Snowbridge',
    },
  }

  export const MYTH: Token = {
    id: 'mythos',
    name: 'Mythos',
    symbol: 'MYTH',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/22125.png',
    decimals: 18,
    address: '0xba41ddf06b7ffd89d1267b5a93bfef2424eb2003',
    multilocation:
      '{"parents":"2","interior":{"X2":[{"GlobalConsensus":{"Ethereum":{"chainId":"1"}}},{"AccountKey20":{"network":null,"key":"0xba41ddf06b7ffd89d1267b5a93bfef2424eb2003"}}]}}',
    coingeckoId: 'mythos',
    origin: {
      type: 'Polkadot',
      paraId: 3369,
    },
  }

  export const BNC: Token = {
    id: 'bnc',
    name: 'Bifrost Native Coin',
    symbol: 'BNC',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/8705.png',
    decimals: 12,
    address: '',
    multilocation:
      '{"parents":"1","interior":{"X2":[{"Parachain":"2030"},{"GeneralKey":{"length":"2","data":"0x0001000000000000000000000000000000000000000000000000000000000000"}}]}}',
    coingeckoId: 'bifrost-native-coin',
    origin: {
      type: 'Polkadot',
      paraId: 2030,
    },
  }

  export const SHIB: Token = {
    id: 'shib',
    name: 'Shiba Inu',
    symbol: 'SHIB',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5994.png',
    decimals: 18,
    address: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce',
    multilocation:
      '{"parents":"2","interior":{"X2":[{"GlobalConsensus":{"Ethereum":{"chainId":"1"}}},{"AccountKey20":{"network":null,"key":"0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce"}}]}}',
    origin: {
      type: 'Ethereum',
      bridge: 'Snowbridge',
    },
  }

  export const PEPE: Token = {
    id: 'pepe',
    name: 'Pepe',
    symbol: 'PEPE',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/24478.png',
    decimals: 18,
    address: '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
    multilocation:
      '{"parents":"2","interior":{"X2":[{"GlobalConsensus":{"Ethereum":{"chainId":"1"}}},{"AccountKey20":{"network":null,"key":"0x6982508145454Ce325dDbE47a25d4ec3d2311933"}}]}}',
    origin: {
      type: 'Ethereum',
      bridge: 'Snowbridge',
    },
  }

  export const TON: Token = {
    id: 'ton',
    name: 'Toncoin',
    symbol: 'TON',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png',
    decimals: 9,
    address: '0x582d872a1b094fc48f5de31d3b73f2d9be47def1',
    multilocation:
      '{"parents":"2","interior":{"X2":[{"GlobalConsensus":{"Ethereum":{"chainId":"1"}}},{"AccountKey20":{"network":null,"key":"0x582d872a1b094fc48f5de31d3b73f2d9be47def1"}}]}}',
    origin: {
      type: 'Ethereum',
      bridge: 'Snowbridge',
    },
  }

  export const WSTETH: Token = {
    id: 'wsteth',
    name: 'Lido wstETH',
    symbol: 'WSTETH',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/12409.png',
    decimals: 18,
    address: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
    multilocation:
      '{"parents":"2","interior":{"X2":[{"GlobalConsensus":{"Ethereum":{"chainId":"1"}}},{"AccountKey20":{"network":null,"key":"0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0"}}]}}',
    coingeckoId: 'bridged-wrapped-lido-staked-ether-scroll',
    origin: {
      type: 'Ethereum',
      bridge: 'Snowbridge',
    },
  }

  export const TBTC: Token = {
    id: 'tbtc',
    name: 'tBTC',
    symbol: 'TBTC',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5776.png',
    decimals: 18,
    address: '0x18084fbA666a33d37592fA2633fD49a74DD93a88',
    multilocation:
      '{"parents":"2","interior":{"X2":[{"GlobalConsensus":{"Ethereum":{"chainId":"1"}}},{"AccountKey20":{"network":null,"key":"0x18084fbA666a33d37592fA2633fD49a74DD93a88"}}]}}',
    origin: {
      type: 'Ethereum',
      bridge: 'Snowbridge',
    },
  }

  export const USDT: Token = {
    id: 'usdt',
    name: 'Tether',
    symbol: 'USDT',
    logoURI: 'https://cryptologos.cc/logos/tether-usdt-logo.svg',
    decimals: 6,
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    multilocation:
      '{"parents":"2","interior":{"X2":[{"GlobalConsensus":{"Ethereum":{"chainId":"1"}}},{"AccountKey20":{"network":null,"key":"0xdac17f958d2ee523a2206206994597c13d831ec7"}}]}}',
    origin: {
      type: 'Ethereum',
      bridge: 'Snowbridge',
    },
  }

  export const USDC: Token = {
    id: 'usdc',
    name: 'USDC',
    symbol: 'USDC',
    logoURI: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg',
    decimals: 6,
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    multilocation:
      '{"parents":"2","interior":{"X2":[{"GlobalConsensus":{"Ethereum":{"chainId":"1"}}},{"AccountKey20":{"network":null,"key":"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"}}]}}',
    origin: {
      type: 'Ethereum',
      bridge: 'Snowbridge',
    },
  }

  export const DAI: Token = {
    id: 'dai',
    name: 'DAI',
    symbol: 'DAI',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4943.png',
    decimals: 18,
    address: '0x6b175474e89094c44da98b954eedeac495271d0f',
    multilocation:
      '{"parents":"2","interior":{"X2":[{"GlobalConsensus":{"Ethereum":{"chainId":"1"}}},{"AccountKey20":{"network":null,"key":"0x6b175474e89094c44da98b954eedeac495271d0f"}}]}}',
    origin: {
      type: 'Ethereum',
      bridge: 'Snowbridge',
    },
  }

  export const DOT: Token = {
    id: 'dot',
    name: 'Polkadot',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/6636.png',
    symbol: 'DOT',
    decimals: 10,
    address: '',
    multilocation: '{"V2":{"parents":"1","interior":"Here"}}',
    origin: {
      type: 'Polkadot',
      paraId: 0,
    },
  }

  export const ETH: Token = {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
    decimals: 18,
    address: '',
    // We won't need a multilocation for Ethereum-native tokens since we can't bridge them to Polkadot.
    multilocation: '',
    origin: {
      type: 'Ethereum',
      bridge: 'Snowbridge',
    },
  }
}

/* Testnet :: Rococo - Sepolia */
export namespace Testnet {
  // Chains
  export const Sepolia: Chain = {
    uid: 'sepolia',
    name: 'Sepolia',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
    chainId: 11155111,
    network: Network.Ethereum,
    supportedAddressTypes: ['evm'],
  }

  export const RococoAssetHub: Chain = {
    uid: 'rococo-assethub',
    name: 'Rococo Asset Hub',
    logoURI: 'https://parachains.info/images/parachains/1688559044_assethub.svg',
    chainId: 1000,
    network: Network.Polkadot,
    supportedAddressTypes: ['ss58'],
    rpcConnection: 'wss://rococo-asset-hub-rpc.polkadot.io',
    specName: 'asset-hub-rococo',
  }

  // Tokens
  export const WETH: Token = {
    id: 'weth',
    name: 'Wrapped Ether',
    symbol: 'wETH',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2396.png',
    decimals: 18,
    address: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
    multilocation:
      '{"parents":"2","interior":{"X2":[{"GlobalConsensus":{"Ethereum":{"chainId":"11155111"}}},{"AccountKey20":{"network":null,"key":"0xfff9976782d46cc05630d1f6ebab18b2324d6b14"}}]}}',
    coingeckoId: 'weth',
    origin: {
      type: 'Ethereum',
      bridge: 'Snowbridge',
    },
  }

  export const VETH: Token = {
    id: 'veth',
    name: 'Venus ETH',
    symbol: 'vETH',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7963.png',
    decimals: 18,
    address: '0xc3d088842dcf02c13699f936bb83dfbbc6f721ab',
    multilocation:
      '{"parents":"2","interior":{"X2":[{"GlobalConsensus":{"Ethereum":{"chainId":"11155111"}}},{"AccountKey20":{"network":null,"key":"0xc3d088842dcf02c13699f936bb83dfbbc6f721ab"}}]}}',
    origin: {
      type: 'Ethereum',
      bridge: 'Snowbridge',
    },
  }

  export const ETH: Token = {
    id: 'seth',
    name: 'Sepolia Ether',
    symbol: 'sETH',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
    decimals: 18,
    address: '',
    // We won't need a multilocation for Ethereum-native tokens since we can't bridge them to Polkadot.
    multilocation: '',
    origin: {
      type: 'Ethereum',
      bridge: 'Snowbridge',
    },
  }

  export const ROC: Token = {
    id: 'roc',
    name: 'Rococo',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/6636.png',
    symbol: 'ROC',
    decimals: 12,
    address: '',
    multilocation: '{"V2":{"parents":"1","interior":"Here"}}',
    origin: {
      type: 'Polkadot',
      paraId: 0,
    },
  }
}

export type TransferSDK = 'SnowbridgeApi'

export interface Registry {
  chains: Chain[]
  tokens: Token[]
  routes: Route[]
}

export interface Route {
  from: string
  to: string
  sdk: TransferSDK
  tokens: string[]
}

export const mainnetRegistry: Registry = {
  chains: [Mainnet.Ethereum, Mainnet.AssetHub, Mainnet.Bifrost, Mainnet.Mythos, Mainnet.Moonbeam],
  tokens: [
    Mainnet.WETH,
    Mainnet.WBTC,
    Mainnet.USDC,
    Mainnet.USDT,
    Mainnet.DAI,
    Mainnet.MYTH,
    Mainnet.WSTETH,
    Mainnet.TBTC,
    Mainnet.TON,
    Mainnet.SHIB,
    Mainnet.PEPE,
  ],
  routes: [
    {
      from: Mainnet.Ethereum.uid,
      to: Mainnet.AssetHub.uid,
      sdk: 'SnowbridgeApi',
      tokens: [
        Mainnet.WETH.id,
        Mainnet.WBTC.id,
        Mainnet.USDC.id,
        Mainnet.USDT.id,
        Mainnet.DAI.id,
        Mainnet.MYTH.id,
        Mainnet.WSTETH.id,
        Mainnet.TBTC.id,
        Mainnet.TON.id,
        Mainnet.SHIB.id,
        Mainnet.PEPE.id,
      ],
    },
    {
      from: Mainnet.Ethereum.uid,
      to: Mainnet.Mythos.uid,
      sdk: 'SnowbridgeApi',
      tokens: [Mainnet.MYTH.id],
    },
    {
      from: Mainnet.Ethereum.uid,
      to: Mainnet.Moonbeam.uid,
      sdk: 'SnowbridgeApi',
      tokens: [Mainnet.WETH.id, Mainnet.WBTC.id],
    },
    {
      from: Mainnet.Ethereum.uid,
      to: Mainnet.Bifrost.uid,
      sdk: 'SnowbridgeApi',
      tokens: [Mainnet.WETH.id],
    },
    {
      from: Mainnet.AssetHub.uid,
      to: Mainnet.Ethereum.uid,
      sdk: 'SnowbridgeApi',
      tokens: [
        Mainnet.WETH.id,
        Mainnet.WBTC.id,
        Mainnet.USDC.id,
        Mainnet.USDT.id,
        Mainnet.DAI.id,
        Mainnet.MYTH.id,
        Mainnet.WSTETH.id,
        Mainnet.TBTC.id,
        Mainnet.TON.id,
        Mainnet.SHIB.id,
        Mainnet.PEPE.id,
      ],
    },
    // {
    //   from: Mainnet.Bifrost.uid,
    //   to: Mainnet.AssetHub.uid,
    //   sdk: 'ParaSpellApi',
    //   tokens: [Mainnet.WETH.id],
    // },
    // {
    //   from: Mainnet.Mythos.uid,
    //   to: Mainnet.AssetHub.uid,
    //   sdk: 'ParaSpellApi',
    //   tokens: [Mainnet.MYTH.id],
    // },
  ],
}

export const testnetRegistry: Registry = {
  chains: [Testnet.Sepolia, Testnet.RococoAssetHub],
  tokens: [Testnet.WETH, Testnet.VETH],
  routes: [
    {
      from: Testnet.Sepolia.uid,
      to: Testnet.RococoAssetHub.uid,
      tokens: [Testnet.WETH.id, Testnet.VETH.id],
      sdk: 'SnowbridgeApi',
    },
    {
      from: Testnet.RococoAssetHub.uid,
      to: Testnet.Sepolia.uid,
      tokens: [Testnet.WETH.id, Testnet.VETH.id],
      sdk: 'SnowbridgeApi',
    },
  ],
}

export const REGISTRY = {
  mainnet: mainnetRegistry,
  testnet: testnetRegistry,
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
    case 'mythos':
      return Mainnet.MYTH
    case 'bifrost':
      return Mainnet.BNC
    default:
      throw Error('The impossible has happened!')
  }
}
