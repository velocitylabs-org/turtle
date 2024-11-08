import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { getRelayNode } from '@/utils/paraspell'
import { assets, getNativeAssetSymbol, TCurrencyCore } from '@paraspell/sdk'
import { Environment } from '../store/environmentStore'

const DWELLIR_KEY = process.env.NEXT_PUBLIC_DWELLIR_KEY

/* Mainnet :: Polkadot - Ethereum */
export namespace Mainnet {
  // Chains
  export const Ethereum: Chain = {
    uid: 'ethereum',
    name: 'Ethereum',
    logoURI: '/ethereum.svg',
    chainId: 1,
    network: 'Ethereum',
    supportedAddressTypes: ['evm'],
  }

  export const AssetHub: Chain = {
    uid: 'polkadot-assethub',
    name: 'Polkadot Asset Hub',
    logoURI: 'https://parachains.info/images/parachains/1688559044_assethub.svg',
    chainId: 1000,
    network: 'Polkadot',
    supportedAddressTypes: ['ss58'],
    rpcConnection: `wss://api-asset-hub-polkadot.dwellir.com/${DWELLIR_KEY}`,
  }

  export const RelayChain: Chain = {
    uid: 'polkadot',
    name: 'Polkadot Relay Chain',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/6636.png',
    chainId: 0,
    network: 'Polkadot',
    supportedAddressTypes: ['ss58'],
    rpcConnection: `wss://api-polkadot.dwellir.com/${DWELLIR_KEY}`,
  }

  export const BridgeHub: Chain = {
    uid: 'polkadot-bridgehub',
    name: 'Polkadot Bridge Hub',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/6636.png',
    chainId: 1002,
    network: 'Polkadot',
    supportedAddressTypes: ['ss58'],
    rpcConnection: `wss://api-bridge-hub-polkadot.dwellir.com/${DWELLIR_KEY}`,
  }

  export const Bifrost: Chain = {
    uid: 'bifrost',
    name: 'Bifrost',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/8705.png',
    chainId: 2030,
    destinationFeeDOT: '20000000',
    network: 'Polkadot',
    supportedAddressTypes: ['ss58'],
    rpcConnection: `wss://api-bifrost-polkadot.dwellir.com/${DWELLIR_KEY}`,
  }

  export const Hydration: Chain = {
    uid: 'hydration',
    name: 'Hydration',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/6753.png',
    chainId: 2034,
    destinationFeeDOT: '20000000',
    network: 'Polkadot',
    supportedAddressTypes: ['ss58'],
    rpcConnection: `wss://api-hydradx.dwellir.com/${DWELLIR_KEY}`,
  }

  export const Moonbeam: Chain = {
    uid: 'moonbeam',
    name: 'Moonbeam',
    logoURI: 'https://parachains.info/images/parachains/1716448660_moonbeam_logo.jpg',
    chainId: 2004,
    destinationFeeDOT: '500000000',
    network: 'Polkadot',
    supportedAddressTypes: ['evm'],
    rpcConnection: `wss://api-moonbeam.dwellir.com/${DWELLIR_KEY}`,
  }

  export const Interlay: Chain = {
    uid: 'interlay',
    name: 'Interlay',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/20366.png',
    chainId: 2032,
    destinationFeeDOT: '', // TODO
    network: 'Polkadot',
    supportedAddressTypes: ['ss58'],
    rpcConnection: `wss://api-interlay.dwellir.com/${DWELLIR_KEY}`,
  }

  export const Acala: Chain = {
    uid: 'acala',
    name: 'Acala',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/6756.png',
    chainId: 2000,
    destinationFeeDOT: '', // TODO
    network: 'Polkadot',
    supportedAddressTypes: ['ss58'],
    rpcConnection: `wss://api-acala.dwellir.com/${DWELLIR_KEY}`,
  }

  export const Polimec: Chain = {
    uid: 'polimec',
    name: 'Polimec',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/28501.png',
    chainId: 3344,
    destinationFeeDOT: '', // TODO
    network: 'Polkadot',
    supportedAddressTypes: ['ss58'],
    rpcConnection: ``, // TODO
  }

  export const Centrifuge: Chain = {
    uid: 'centrifuge',
    name: 'Centrifuge',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/6748.png',
    chainId: 2031,
    destinationFeeDOT: '', // TODO
    network: 'Polkadot',
    supportedAddressTypes: ['ss58'],
    rpcConnection: `wss://api-centrifuge.dwellir.com/${DWELLIR_KEY}`,
  }

  export const Astar: Chain = {
    uid: 'astar',
    name: 'Astar',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/12885.png',
    chainId: 2006,
    destinationFeeDOT: '', // TODO
    network: 'Polkadot',
    supportedAddressTypes: ['ss58'],
    rpcConnection: `wss://api-astar.dwellir.com/${DWELLIR_KEY}`,
  }

  export const Mythos: Chain = {
    uid: 'mythos',
    name: 'Mythos',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/22125.png',
    chainId: 3369,
    destinationFeeDOT: '500000000',
    network: 'Polkadot',
    supportedAddressTypes: ['evm'],
    rpcConnection: 'wss://polkadot-mythos-rpc.polkadot.io',
  }

  // Tokens
  export const WETH: Token = {
    id: 'weth.e',
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
    id: 'veth.e',
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
    id: 'wbtc.e',
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
    id: 'myth.e',
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

  export const HDX: Token = {
    id: 'hdx',
    name: 'Hydration',
    symbol: 'HDX',
    logoURI: 'https://parachains.info/images/parachains/1717606865_hydration_logo.jpg',
    decimals: 12,
    address: '',
    multilocation: '{"parents":"1","interior":{"X2":[{"Parachain":"2034"},{"GeneralIndex":"0"}]}}',
    coingeckoId: 'hydradx',
    origin: {
      type: 'Polkadot',
      paraId: 2034,
    },
  }

  export const ACA: Token = {
    id: 'aca',
    name: 'Acala Token',
    symbol: 'ACA',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/6756.png',
    decimals: 12,
    address: '',
    multilocation:
      '{"parents":"1","interior":{"X2":[{"Parachain":"2000"},{"GeneralKey":"0x0000"}]}}',
    coingeckoId: 'acala',
    origin: {
      type: 'Polkadot',
      paraId: 2000,
    },
  }

  export const ASTR: Token = {
    id: 'astr',
    name: 'ASTR',
    symbol: 'ASTR',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/12885.png',
    decimals: 18,
    address: '',
    multilocation: '{"parents":"1","interior":{"X1":{"Parachain":"2006"}}}',
    coingeckoId: 'astar',
    origin: {
      type: 'Polkadot',
      paraId: 2006,
    },
  }

  export const GLMR: Token = {
    id: 'glmr',
    name: 'GLMR',
    symbol: 'GLMR',
    logoURI: 'https://parachains.info/images/parachains/1716448660_moonbeam_logo.jpg',
    decimals: 18,
    address: '',
    multilocation:
      '{"parents":"1","interior":{"X2":[{"Parachain":"2004"},{"PalletInstance":"10"}]}}',
    coingeckoId: 'moonbeam',
    origin: {
      type: 'Polkadot',
      paraId: 2004,
    },
  }

  export const INTR: Token = {
    id: 'intr',
    name: 'INTR',
    symbol: 'INTR',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/20366.png',
    decimals: 10,
    address: '',
    multilocation:
      '{"parents":"1","interior":{"X2":[{"Parachain":"2032"},{"GeneralKey":"0x0001"}]}}',
    coingeckoId: 'interlay',
    origin: {
      type: 'Polkadot',
      paraId: 2032,
    },
  }

  export const CFG: Token = {
    id: 'cfg',
    name: 'Centrifuge',
    symbol: 'CFG',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/6748.png',
    decimals: 18,
    address: '',
    multilocation:
      '{"parents":"1","interior":{"X2":[{"Parachain":"2031"},{"GeneralKey":"0x0001"}]}}',
    coingeckoId: 'centrifuge',
    origin: {
      type: 'Polkadot',
      paraId: 2031,
    },
  }

  export const SHIB: Token = {
    id: 'shib.e',
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
    id: 'pepe.e',
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
    id: 'ton.e',
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
    id: 'wsteth.e',
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
    id: 'tbtc.e',
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
  // Snowbridge USDT
  export const USDT: Token = {
    id: 'usdt.e',
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

  // Snowbridge USDC
  export const USDC: Token = {
    id: 'usdc.e',
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
    id: 'dai.e',
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
    coingeckoId: 'polkadot',
    origin: {
      type: 'Polkadot',
      paraId: 0,
    },
  }

  export const ETH: Token = {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    logoURI: '/ethereum.svg',
    decimals: 18,
    address: '',
    // We won't need a multilocation for Ethereum-native tokens since we can't bridge them to Polkadot.
    multilocation: '',
    coingeckoId: 'ethereum',
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
    network: 'Ethereum',
    supportedAddressTypes: ['evm'],
  }

  export const RococoAssetHub: Chain = {
    uid: 'rococo-assethub',
    name: 'Rococo Asset Hub',
    logoURI: 'https://parachains.info/images/parachains/1688559044_assethub.svg',
    chainId: 1000,
    network: 'Polkadot',
    supportedAddressTypes: ['ss58'],
    rpcConnection: 'wss://rococo-asset-hub-rpc.polkadot.io',
  }

  // Tokens
  export const WETH: Token = {
    id: 'weth.e',
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
    id: 'veth.e',
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

export type TransferSDK = 'SnowbridgeApi' | 'ParaSpellApi'

// A Turtle-defined unique chain identifier
type ChainUId = string
// A Turtle-defined unique token identifier
type TokenId = string
// An unambiguous reference to a an asset within the local context of a chain,
// either the token symbol or the asset id at a given chain
type LocalAssetUid = TCurrencyCore

export interface Registry {
  chains: Chain[]
  tokens: Token[]
  routes: Route[]
  // Assets are often uniquely identified by a "asset id" at each chain, making it a chain-dependant value.
  // The SDKs we use accept the token symbol as the indexing value to work with a given token but some chains
  // might have said token registered with a different symbol (for example with a different pre or suffix),
  // or have multiple tokens with the same symbol, in which case we need this map to provide the exact asset
  // symbol or id at that given chain to disambiguate.
  assetUid: Map<ChainUId, Map<TokenId, LocalAssetUid>>
}

export interface Route {
  from: string
  to: string
  sdk: TransferSDK
  tokens: string[]
}

export const mainnetRegistry: Registry = {
  chains: [
    Mainnet.Ethereum,
    Mainnet.AssetHub,
    Mainnet.RelayChain,
    Mainnet.Bifrost,
    Mainnet.Mythos,
    Mainnet.Hydration,
    Mainnet.Acala,
    Mainnet.Moonbeam,
    Mainnet.Interlay,
    Mainnet.Polimec,
    Mainnet.Centrifuge,
    Mainnet.Astar,
  ],
  tokens: [
    Mainnet.WETH,
    Mainnet.WBTC,
    Mainnet.USDC,
    Mainnet.USDT,
    Mainnet.WSTETH,
    Mainnet.TBTC,
    Mainnet.DOT,
    Mainnet.DAI,
    Mainnet.ACA,
    Mainnet.CFG,
    Mainnet.BNC,
    Mainnet.GLMR,
    Mainnet.ASTR,
    Mainnet.INTR,
    Mainnet.MYTH,
    Mainnet.HDX,
    Mainnet.TON,
    Mainnet.SHIB,
    Mainnet.PEPE,
  ],
  routes: [
    // Snowbridge routes
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
      from: Mainnet.Ethereum.uid,
      to: Mainnet.Hydration.uid,
      sdk: 'SnowbridgeApi',
      tokens: [Mainnet.WETH.id, Mainnet.WBTC.id],
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
    // Relay to Para
    {
      from: Mainnet.RelayChain.uid,
      to: Mainnet.AssetHub.uid,
      sdk: 'ParaSpellApi',
      tokens: [Mainnet.DOT.id],
    },
    {
      from: Mainnet.RelayChain.uid,
      to: Mainnet.Acala.uid,
      sdk: 'ParaSpellApi',
      tokens: [Mainnet.DOT.id],
    },
    {
      from: Mainnet.RelayChain.uid,
      to: Mainnet.Moonbeam.uid,
      sdk: 'ParaSpellApi',
      tokens: [Mainnet.DOT.id],
    },
    {
      from: Mainnet.RelayChain.uid,
      to: Mainnet.Hydration.uid,
      sdk: 'ParaSpellApi',
      tokens: [Mainnet.DOT.id],
    },
    {
      from: Mainnet.RelayChain.uid,
      to: Mainnet.Interlay.uid,
      sdk: 'ParaSpellApi',
      tokens: [Mainnet.DOT.id],
    },
    {
      from: Mainnet.RelayChain.uid,
      to: Mainnet.Centrifuge.uid,
      sdk: 'ParaSpellApi',
      tokens: [Mainnet.DOT.id],
    },
    {
      from: Mainnet.RelayChain.uid,
      to: Mainnet.Astar.uid,
      sdk: 'ParaSpellApi',
      tokens: [Mainnet.DOT.id],
    },
    {
      from: Mainnet.RelayChain.uid,
      to: Mainnet.Bifrost.uid,
      sdk: 'ParaSpellApi',
      tokens: [Mainnet.DOT.id],
    },

    // Para to Relay
    {
      from: Mainnet.AssetHub.uid,
      to: Mainnet.RelayChain.uid,
      sdk: 'ParaSpellApi',
      tokens: [Mainnet.DOT.id],
    },
    {
      from: Mainnet.AssetHub.uid,
      to: Mainnet.Hydration.uid,
      sdk: 'ParaSpellApi',
      tokens: [Mainnet.DOT.id],
    },
    {
      from: Mainnet.Acala.uid,
      to: Mainnet.RelayChain.uid,
      sdk: 'ParaSpellApi',
      tokens: [Mainnet.DOT.id],
    },
    {
      from: Mainnet.Hydration.uid,
      to: Mainnet.AssetHub.uid,
      sdk: 'ParaSpellApi',
      tokens: [Mainnet.DOT.id],
    },
    {
      from: Mainnet.Bifrost.uid,
      to: Mainnet.RelayChain.uid,
      sdk: 'ParaSpellApi',
      tokens: [Mainnet.DOT.id],
    },
    {
      from: Mainnet.Interlay.uid,
      to: Mainnet.RelayChain.uid,
      sdk: 'ParaSpellApi',
      tokens: [Mainnet.DOT.id],
    },

    // Para to Para
    {
      from: Mainnet.Acala.uid,
      to: Mainnet.Hydration.uid,
      sdk: 'ParaSpellApi',
      tokens: [Mainnet.ACA.id, Mainnet.DOT.id],
    },
    {
      from: Mainnet.Hydration.uid,
      to: Mainnet.Moonbeam.uid,
      sdk: 'ParaSpellApi',
      tokens: [Mainnet.DOT.id, Mainnet.HDX.id],
    },
    {
      from: Mainnet.Hydration.uid,
      to: Mainnet.Moonbeam.uid,
      sdk: 'ParaSpellApi',
      tokens: [Mainnet.DOT.id, Mainnet.HDX.id, Mainnet.GLMR.id],
    },
    {
      from: Mainnet.Hydration.uid,
      to: Mainnet.Bifrost.uid,
      sdk: 'ParaSpellApi',
      tokens: [Mainnet.DOT.id, Mainnet.BNC.id],
    },
    {
      from: Mainnet.Interlay.uid,
      to: Mainnet.Hydration.uid,
      sdk: 'ParaSpellApi',
      tokens: [Mainnet.DOT.id],
    },
    {
      from: Mainnet.Hydration.uid,
      to: Mainnet.Interlay.uid,
      sdk: 'ParaSpellApi',
      tokens: [Mainnet.DOT.id, Mainnet.INTR.id, Mainnet.HDX.id],
    },
    {
      from: Mainnet.Hydration.uid,
      to: Mainnet.Acala.uid,
      sdk: 'ParaSpellApi',
      tokens: [Mainnet.DOT.id, Mainnet.ACA.id, Mainnet.HDX.id],
    },
    {
      from: Mainnet.Hydration.uid,
      to: Mainnet.Centrifuge.uid,
      sdk: 'ParaSpellApi',
      tokens: [Mainnet.DOT.id, Mainnet.CFG.id],
    },
    {
      from: Mainnet.Centrifuge.uid,
      to: Mainnet.Hydration.uid,
      sdk: 'ParaSpellApi',
      tokens: [Mainnet.CFG.id],
    },
    {
      from: Mainnet.Hydration.uid,
      to: Mainnet.Astar.uid,
      sdk: 'ParaSpellApi',
      tokens: [
        Mainnet.DOT.id,
        Mainnet.ASTR.id,
        Mainnet.HDX.id,
        Mainnet.GLMR.id,
        Mainnet.ACA.id,
        Mainnet.INTR.id,
      ],
    },
    {
      from: Mainnet.Astar.uid,
      to: Mainnet.Hydration.uid,
      sdk: 'ParaSpellApi',
      tokens: [
        Mainnet.DOT.id,
        Mainnet.ASTR.id,
        Mainnet.HDX.id,
        Mainnet.GLMR.id,
        Mainnet.ACA.id,
        Mainnet.INTR.id,
      ],
    },
    {
      from: Mainnet.Astar.uid,
      to: Mainnet.Moonbeam.uid,
      sdk: 'ParaSpellApi',
      tokens: [Mainnet.DOT.id, Mainnet.ASTR.id, Mainnet.GLMR.id],
    },
  ],
  assetUid: new Map([
    [Mainnet.Hydration.uid, new Map([[Mainnet.WETH.id, { id: '1000189' } as LocalAssetUid]])],
    [
      Mainnet.AssetHub.uid,
      new Map([
        [Mainnet.USDC.id, { symbol: 'USDC.e' }],
        [Mainnet.WETH.id, { symbol: 'WETH.e' }],
        [Mainnet.WBTC.id, { symbol: 'WBTC.e' }],
        [Mainnet.USDT.id, { symbol: 'USDT.e' }],
      ]),
    ],
  ]),
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
  assetUid: new Map(),
}

export const REGISTRY = {
  mainnet: mainnetRegistry,
  testnet: testnetRegistry,
}

export const SNOWBRIDGE_MAINNET_PARACHAIN_URLS = [
  rpcConnectionAsHttps(Mainnet.Mythos.rpcConnection),
  rpcConnectionAsHttps(Mainnet.Bifrost.rpcConnection),
  rpcConnectionAsHttps(Mainnet.Hydration.rpcConnection),
  rpcConnectionAsHttps(Mainnet.Moonbeam.rpcConnection),
]

export function getNativeToken(chain: Chain): Token {
  const env = REGISTRY.testnet.chains.map(c => c.uid).includes(chain.uid)
    ? Environment.Testnet
    : Environment.Mainnet

  const relay = getRelayNode(env)
  const chainNode = assets.getTNode(chain.chainId, relay)
  if (!chainNode) throw Error(`Native Token for ${chain.uid} not found`)

  const symbol = getNativeAssetSymbol(chainNode)
  const token = REGISTRY[env].tokens.find(t => t.symbol === symbol) // TODO handle duplicate symbols
  if (!token) throw Error(`Native Token for ${chain.uid} not found`)
  return token
}

export function rpcConnectionAsHttps(rpc?: string): string {
  if (!rpc) return ''
  return rpc.replace('wss://', 'https://')
}

export function getAssetUid(
  env: Environment,
  chainId: string,
  tokenId: string,
): LocalAssetUid | undefined {
  return REGISTRY[env].assetUid.get(chainId)?.get(tokenId)
}

export function isAssetHub(chain: Chain): boolean {
  return chain.network == 'Polkadot' && chain.chainId === 1000
}
