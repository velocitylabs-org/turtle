import { Token } from '@/models/token'
import { parachain, snowbridgeWrapped } from '..'

// Tokens
export namespace Eth {
  export const ETH: Token = {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    logoURI: '/logos/ethereum.svg',
    decimals: 18,
    address: '',
    // We won't need a multilocation for Ethereum-native tokens since we can't bridge them to Polkadot.
    multilocation: '',
    coingeckoId: 'ethereum',
    origin: snowbridgeWrapped(),
  }

  // Snowbridge-wrapped USDC
  export const USDC: Token = {
    id: 'usdc.e',
    name: 'USDC',
    symbol: 'USDC',
    logoURI: '/logos/usdc.svg',
    decimals: 6,
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    multilocation:
      '{"parents":"2","interior":{"X2":[{"GlobalConsensus":{"Ethereum":{"chainId":"1"}}},{"AccountKey20":{"network":null,"key":"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"}}]}}',
    origin: snowbridgeWrapped(),
    coingeckoId: 'usd-coin',
  }

  export const DAI: Token = {
    id: 'dai.e',
    name: 'DAI',
    symbol: 'DAI',
    logoURI: '/logos/dai.svg',
    decimals: 18,
    address: '0x6b175474e89094c44da98b954eedeac495271d0f',
    multilocation:
      '{"parents":"2","interior":{"X2":[{"GlobalConsensus":{"Ethereum":{"chainId":"1"}}},{"AccountKey20":{"network":null,"key":"0x6b175474e89094c44da98b954eedeac495271d0f"}}]}}',
    origin: snowbridgeWrapped(),
  }

  export const USDT: Token = {
    id: 'usdt.e',
    name: 'Tether',
    symbol: 'USDT',
    logoURI: '/logos/usdt.svg',
    decimals: 6,
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    multilocation:
      '{"parents":"2","interior":{"X2":[{"GlobalConsensus":{"Ethereum":{"chainId":"1"}}},{"AccountKey20":{"network":null,"key":"0xdac17f958d2ee523a2206206994597c13d831ec7"}}]}}',
    origin: snowbridgeWrapped(),
  }

  export const WETH: Token = {
    id: 'weth.e',
    name: 'Wrapped Ether',
    symbol: 'wETH',
    logoURI: '/logos/weth.svg',
    decimals: 18,
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    multilocation:
      '{"parents":"2","interior":{"X2":[{"GlobalConsensus":{"Ethereum":{"chainId":"1"}}},{"AccountKey20":{"network":null,"key":"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"}}]}}',
    coingeckoId: 'weth',
    origin: snowbridgeWrapped(),
  }

  export const VETH: Token = {
    id: 'veth.e',
    name: 'Venus ETH',
    symbol: 'vETH',
    logoURI: '/logos/veth.svg',
    decimals: 18,
    address: '0xc3d088842dcf02c13699f936bb83dfbbc6f721ab',
    multilocation:
      '{"parents":"2","interior":{"X2":[{"GlobalConsensus":{"Ethereum":{"chainId":"1"}}},{"AccountKey20":{"network":null,"key":"0xc3d088842dcf02c13699f936bb83dfbbc6f721ab"}}]}}',
    origin: snowbridgeWrapped(),
  }

  export const WBTC: Token = {
    id: 'wbtc.e',
    name: 'Wrapped Bitcoin',
    symbol: 'WBTC',
    logoURI: '/logos/wbtc.svg',
    decimals: 8,
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    multilocation:
      '{"parents":"2","interior":{"X2":[{"GlobalConsensus":{"Ethereum":{"chainId":"1"}}},{"AccountKey20":{"network":null,"key":"0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"}}]}}',
    origin: snowbridgeWrapped(),
  }

  export const MYTH: Token = {
    id: 'myth.e',
    name: 'Mythos',
    symbol: 'MYTH',
    logoURI: '/logos/myth.svg',
    decimals: 18,
    address: '0xba41ddf06b7ffd89d1267b5a93bfef2424eb2003',
    multilocation:
      '{"parents":"2","interior":{"X2":[{"GlobalConsensus":{"Ethereum":{"chainId":"1"}}},{"AccountKey20":{"network":null,"key":"0xba41ddf06b7ffd89d1267b5a93bfef2424eb2003"}}]}}',
    coingeckoId: 'mythos',
    origin: snowbridgeWrapped(),
  }

  export const SHIB: Token = {
    id: 'shib.e',
    name: 'Shiba Inu',
    symbol: 'SHIB',
    logoURI: '/logos/shib.svg',
    decimals: 18,
    address: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce',
    multilocation:
      '{"parents":"2","interior":{"X2":[{"GlobalConsensus":{"Ethereum":{"chainId":"1"}}},{"AccountKey20":{"network":null,"key":"0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce"}}]}}',
    origin: snowbridgeWrapped(),
  }

  export const PEPE: Token = {
    id: 'pepe.e',
    name: 'Pepe',
    symbol: 'PEPE',
    logoURI: '/logos/pepe.svg',
    decimals: 18,
    address: '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
    multilocation:
      '{"parents":"2","interior":{"X2":[{"GlobalConsensus":{"Ethereum":{"chainId":"1"}}},{"AccountKey20":{"network":null,"key":"0x6982508145454Ce325dDbE47a25d4ec3d2311933"}}]}}',
    origin: snowbridgeWrapped(),
  }

  export const TON: Token = {
    id: 'ton.e',
    name: 'Toncoin',
    symbol: 'TON',
    logoURI: '/logos/ton.svg',
    decimals: 9,
    address: '0x582d872a1b094fc48f5de31d3b73f2d9be47def1',
    multilocation:
      '{"parents":"2","interior":{"X2":[{"GlobalConsensus":{"Ethereum":{"chainId":"1"}}},{"AccountKey20":{"network":null,"key":"0x582d872a1b094fc48f5de31d3b73f2d9be47def1"}}]}}',
    origin: snowbridgeWrapped(),
  }

  export const WSTETH: Token = {
    id: 'wsteth.e',
    name: 'Lido wstETH',
    symbol: 'WSTETH',
    logoURI: 'logos/wsteth.svg',
    decimals: 18,
    address: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
    multilocation:
      '{"parents":"2","interior":{"X2":[{"GlobalConsensus":{"Ethereum":{"chainId":"1"}}},{"AccountKey20":{"network":null,"key":"0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0"}}]}}',
    coingeckoId: 'bridged-wrapped-lido-staked-ether-scroll',
    origin: snowbridgeWrapped(),
  }

  export const TBTC: Token = {
    id: 'tbtc.e',
    name: 'tBTC',
    symbol: 'TBTC',
    logoURI: '/logos/tbtc.svg',
    decimals: 18,
    address: '0x18084fbA666a33d37592fA2633fD49a74DD93a88',
    multilocation:
      '{"parents":"2","interior":{"X2":[{"GlobalConsensus":{"Ethereum":{"chainId":"1"}}},{"AccountKey20":{"network":null,"key":"0x18084fbA666a33d37592fA2633fD49a74DD93a88"}}]}}',
    origin: snowbridgeWrapped(),
  }
}

export namespace Polkadot {
  export const ACA: Token = {
    id: 'aca',
    name: 'Acala Token',
    symbol: 'ACA',
    logoURI: '/logos/acala.svg',
    decimals: 12,
    address: '',
    multilocation:
      '{"parents":"1","interior":{"X2":[{"Parachain":"2000"},{"GeneralKey":"0x0000"}]}}',
    coingeckoId: 'acala',
    origin: parachain(2000),
  }

  export const ASTR: Token = {
    id: 'astr',
    name: 'ASTR',
    symbol: 'ASTR',
    logoURI: '/logos/astar.svg',
    decimals: 18,
    address: '',
    multilocation: '{"parents":"1","interior":{"X1":{"Parachain":"2006"}}}',
    coingeckoId: 'astar',
    origin: parachain(2006),
  }

  export const BNC: Token = {
    id: 'bnc',
    name: 'Bifrost Native Coin',
    symbol: 'BNC',
    logoURI: '/logos/bifrost.svg',
    decimals: 12,
    address: '',
    multilocation:
      '{"parents":"1","interior":{"X2":[{"Parachain":"2030"},{"GeneralKey":{"length":"2","data":"0x0001000000000000000000000000000000000000000000000000000000000000"}}]}}',
    coingeckoId: 'bifrost-native-coin',
    origin: parachain(2030),
  }

  export const CFG: Token = {
    id: 'cfg',
    name: 'Centrifuge',
    symbol: 'CFG',
    logoURI: '/logos/cfg.svg',
    decimals: 18,
    address: '',
    multilocation:
      '{"parents":"1","interior":{"X2":[{"Parachain":"2031"},{"GeneralKey":"0x0001"}]}}',
    coingeckoId: 'centrifuge',
    origin: parachain(2031),
  }

  export const HDX: Token = {
    id: 'hdx',
    name: 'Hydration',
    symbol: 'HDX',
    logoURI: '/logos/hydra.svg',
    decimals: 12,
    address: '',
    multilocation: '{"parents":"1","interior":{"X2":[{"Parachain":"2034"},{"GeneralIndex":"0"}]}}',
    coingeckoId: 'hydradx',
    origin: parachain(2034),
  }

  // Polkadot-native USDC
  export const USDC: Token = {
    id: 'usdc',
    name: 'USDC',
    symbol: 'USDC',
    logoURI: '/logos/usdc.svg',
    decimals: 6,
    address: '',
    multilocation: '',
    origin: parachain(1000),
    coingeckoId: 'usd-coin',
  }

  // Polkadot-native USDT
  export const USDT: Token = {
    id: 'usdt',
    name: 'Tether',
    symbol: 'USDT',
    logoURI: '/logos/usdt.svg',
    decimals: 6,
    address: '',
    multilocation: '',
    origin: parachain(1000),
  }

  export const GLMR: Token = {
    id: 'glmr',
    name: 'GLMR',
    symbol: 'GLMR',
    logoURI: '/logos/moonbeam.svg',
    decimals: 18,
    address: '',
    multilocation:
      '{"parents":"1","interior":{"X2":[{"Parachain":"2004"},{"PalletInstance":"10"}]}}',
    coingeckoId: 'moonbeam',
    origin: parachain(2004),
  }

  export const INTR: Token = {
    id: 'intr',
    name: 'Interlay',
    symbol: 'INTR',
    logoURI: '/logos/interlay.svg',
    decimals: 10,
    address: '',
    multilocation:
      '{"parents":"1","interior":{"X2":[{"Parachain":"2032"},{"GeneralKey":"0x0001"}]}}',
    coingeckoId: 'interlay',
    origin: parachain(2032),
  }

  export const DOT: Token = {
    id: 'dot',
    name: 'Polkadot',
    logoURI: '/logos/polkadot.svg',
    symbol: 'DOT',
    decimals: 10,
    address: '',
    multilocation: '{"V2":{"parents":"1","interior":"Here"}}',
    coingeckoId: 'polkadot',
    origin: parachain(0),
  }

  export const VDOT: Token = {
    id: 'vdot',
    name: 'Voucher DOT',
    symbol: 'VDOT',
    logoURI: '/logos/vdot.svg',
    decimals: 10,
    address: '',
    multilocation:
      '{"parents":"1","interior":{"X2":[{"Parachain":"2030"},{"GeneralKey":{"length":"2","data":"0x0900000000000000000000000000000000000000000000000000000000000000"}}]}}',
    coingeckoId: 'voucher-dot',
    origin: parachain(2030),
  }

  export const IBTC: Token = {
    id: 'ibtc',
    name: 'IBTC',
    symbol: 'IBTC',
    logoURI: '/logos/ibtc.svg',
    decimals: 8,
    address: '',
    multilocation:
      '{"parents":"1","interior":{"X2":[{"Parachain":"2032"},{"GeneralKey":"0x0001"}]}}',
    coingeckoId: 'interbtc',
    origin: parachain(2032),
  }
}