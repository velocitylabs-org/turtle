import { DWELLIR_KEY } from '@/config'
import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { parachain, Registry, snowbridgeWrapped } from '.'

/* Mainnet :: Polkadot - Ethereum */

// Chains
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
  rpcConnection: `wss://api-polkadot.dwellir.com/${DWELLIR_KEY}`,
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
  destinationFeeDOT: '20000000',
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
  destinationFeeDOT: '20000000',
  network: 'Polkadot',
  supportedAddressTypes: ['ss58'],
  walletType: 'Substrate',
  rpcConnection: `wss://api-hydradx.dwellir.com/${DWELLIR_KEY}`,
}

export const Moonbeam: Chain = {
  uid: 'moonbeam',
  name: 'Moonbeam',
  logoURI: '/logos/moonbeam.svg',
  chainId: 2004,
  destinationFeeDOT: '500000000',
  network: 'Polkadot',
  supportedAddressTypes: ['evm'],
  walletType: 'SubstrateEVM',
  rpcConnection: `wss://api-moonbeam.dwellir.com/${DWELLIR_KEY}`,
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
  rpcConnection: ``, // TODO
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

// Assembling the Mainnet registry
export const REGISTRY: Registry = {
  chains: [
    Ethereum,
    AssetHub,
    RelayChain,
    Bifrost,
    Mythos,
    Hydration,
    Acala,
    Moonbeam,
    Interlay,
    Polimec,
    Centrifuge,
    Astar,
  ],
  tokens: [
    Eth.WETH,
    Eth.WBTC,
    Eth.USDC,
    Polkadot.USDC,
    Eth.USDT,
    Polkadot.USDT,
    Eth.WSTETH,
    Eth.TBTC,
    Polkadot.DOT,
    Eth.DAI,
    Polkadot.ACA,
    Polkadot.CFG,
    Polkadot.BNC,
    Polkadot.GLMR,
    Polkadot.ASTR,
    Polkadot.INTR,
    Polkadot.VDOT,
    Polkadot.IBTC,
    Eth.MYTH,
    Polkadot.HDX,
    Eth.TON,
    Eth.SHIB,
    Eth.PEPE,
  ],
  routes: [
    // Snowbridge routes
    {
      from: Ethereum.uid,
      to: AssetHub.uid,
      sdk: 'SnowbridgeApi',
      tokens: [
        Eth.WETH.id,
        Eth.WBTC.id,
        Eth.USDC.id,
        Eth.USDT.id,
        Eth.DAI.id,
        Eth.MYTH.id,
        Eth.WSTETH.id,
        Eth.TBTC.id,
        Eth.TON.id,
        Eth.SHIB.id,
        Eth.PEPE.id,
      ],
    },
    {
      from: Ethereum.uid,
      to: Mythos.uid,
      sdk: 'SnowbridgeApi',
      tokens: [Eth.MYTH.id],
    },
    {
      from: Ethereum.uid,
      to: Moonbeam.uid,
      sdk: 'SnowbridgeApi',
      tokens: [Eth.WETH.id, Eth.WBTC.id],
    },
    {
      from: Ethereum.uid,
      to: Bifrost.uid,
      sdk: 'SnowbridgeApi',
      tokens: [Eth.WETH.id],
    },
    {
      from: Ethereum.uid,
      to: Hydration.uid,
      sdk: 'SnowbridgeApi',
      tokens: [Eth.WETH.id, Eth.WBTC.id],
    },
    {
      from: AssetHub.uid,
      to: Ethereum.uid,
      sdk: 'SnowbridgeApi',
      tokens: [
        Eth.WETH.id,
        Eth.WBTC.id,
        Eth.USDC.id,
        Eth.USDT.id,
        Eth.DAI.id,
        Eth.MYTH.id,
        Eth.WSTETH.id,
        Eth.TBTC.id,
        Eth.TON.id,
        Eth.SHIB.id,
        Eth.PEPE.id,
      ],
    },
    // Relay to Para
    {
      from: RelayChain.uid,
      to: AssetHub.uid,
      sdk: 'ParaSpellApi',
      tokens: [Polkadot.DOT.id],
    },
    {
      from: RelayChain.uid,
      to: Acala.uid,
      sdk: 'ParaSpellApi',
      tokens: [Polkadot.DOT.id],
    },
    {
      from: RelayChain.uid,
      to: Moonbeam.uid,
      sdk: 'ParaSpellApi',
      tokens: [Polkadot.DOT.id],
    },
    {
      from: RelayChain.uid,
      to: Hydration.uid,
      sdk: 'ParaSpellApi',
      tokens: [Polkadot.DOT.id],
    },
    {
      from: RelayChain.uid,
      to: Interlay.uid,
      sdk: 'ParaSpellApi',
      tokens: [Polkadot.DOT.id],
    },
    {
      from: RelayChain.uid,
      to: Centrifuge.uid,
      sdk: 'ParaSpellApi',
      tokens: [Polkadot.DOT.id],
    },
    {
      from: RelayChain.uid,
      to: Astar.uid,
      sdk: 'ParaSpellApi',
      tokens: [Polkadot.DOT.id],
    },
    {
      from: RelayChain.uid,
      to: Bifrost.uid,
      sdk: 'ParaSpellApi',
      tokens: [Polkadot.DOT.id],
    },

    // Para to Relay
    {
      from: AssetHub.uid,
      to: RelayChain.uid,
      sdk: 'ParaSpellApi',
      tokens: [Polkadot.DOT.id],
    },
    {
      from: AssetHub.uid,
      to: Bifrost.uid,
      sdk: 'ParaSpellApi',
      tokens: [Eth.WETH.id, Polkadot.USDC.id, Polkadot.USDT.id],
    },
    {
      from: AssetHub.uid,
      to: Hydration.uid,
      sdk: 'ParaSpellApi',
      tokens: [Polkadot.DOT.id, Polkadot.USDC.id, Polkadot.USDT.id],
    },
    {
      from: AssetHub.uid,
      to: Moonbeam.uid,
      sdk: 'ParaSpellApi',
      tokens: [Polkadot.USDC.id, Polkadot.USDT.id],
    },
    {
      from: Acala.uid,
      to: RelayChain.uid,
      sdk: 'ParaSpellApi',
      tokens: [Polkadot.DOT.id],
    },
    {
      from: Hydration.uid,
      to: AssetHub.uid,
      sdk: 'ParaSpellApi',
      tokens: [Polkadot.DOT.id, Polkadot.USDC.id, Polkadot.USDT.id],
    },
    {
      from: Bifrost.uid,
      to: RelayChain.uid,
      sdk: 'ParaSpellApi',
      tokens: [Polkadot.DOT.id],
    },
    {
      from: Bifrost.uid,
      to: AssetHub.uid,
      sdk: 'ParaSpellApi',
      tokens: [Polkadot.DOT.id, Eth.WETH.id, Polkadot.USDC.id, Polkadot.USDT.id],
    },
    {
      from: Bifrost.uid,
      to: Centrifuge.uid,
      sdk: 'ParaSpellApi',
      tokens: [Polkadot.DOT.id],
    },
    {
      from: Bifrost.uid,
      to: Hydration.uid,
      sdk: 'ParaSpellApi',
      tokens: [Polkadot.DOT.id, Polkadot.BNC.id, Polkadot.VDOT.id],
    },
    {
      from: Bifrost.uid,
      to: Moonbeam.uid,
      sdk: 'ParaSpellApi',
      tokens: [Polkadot.DOT.id, Polkadot.BNC.id, Polkadot.GLMR.id, Polkadot.VDOT.id],
    },
    {
      from: Bifrost.uid,
      to: Interlay.uid,
      sdk: 'ParaSpellApi',
      tokens: [Polkadot.DOT.id, Polkadot.BNC.id, Polkadot.VDOT.id],
    },
    {
      from: Bifrost.uid,
      to: Acala.uid,
      sdk: 'ParaSpellApi',
      tokens: [Polkadot.DOT.id],
    },
    {
      from: Interlay.uid,
      to: RelayChain.uid,
      sdk: 'ParaSpellApi',
      tokens: [Polkadot.DOT.id],
    },

    // Para to Para
    {
      from: Moonbeam.uid,
      to: Hydration.uid,
      sdk: 'ParaSpellApi',
      tokens: [Polkadot.DOT.id],
    },
    {
      from: Acala.uid,
      to: Hydration.uid,
      sdk: 'ParaSpellApi',
      tokens: [Polkadot.ACA.id, Polkadot.DOT.id],
    },
    {
      from: Hydration.uid,
      to: Moonbeam.uid,
      sdk: 'ParaSpellApi',
      tokens: [
        Polkadot.DOT.id,
        Polkadot.HDX.id,
        Polkadot.GLMR.id,
        Polkadot.BNC.id,
        Polkadot.VDOT.id,
      ],
    },
    {
      from: Hydration.uid,
      to: Bifrost.uid,
      sdk: 'ParaSpellApi',
      tokens: [Polkadot.DOT.id, Polkadot.BNC.id, Polkadot.VDOT.id],
    },
    {
      from: Interlay.uid,
      to: Hydration.uid,
      sdk: 'ParaSpellApi',
      tokens: [Polkadot.DOT.id, Polkadot.VDOT.id, Polkadot.INTR.id, Polkadot.IBTC.id],
    },
    {
      from: Hydration.uid,
      to: Interlay.uid,
      sdk: 'ParaSpellApi',
      tokens: [
        Polkadot.DOT.id,
        Polkadot.INTR.id,
        Polkadot.HDX.id,
        Polkadot.VDOT.id,
        Polkadot.IBTC.id,
      ],
    },
    {
      from: Hydration.uid,
      to: Acala.uid,
      sdk: 'ParaSpellApi',
      tokens: [Polkadot.DOT.id, Polkadot.ACA.id, Polkadot.HDX.id],
    },
    {
      from: Hydration.uid,
      to: Centrifuge.uid,
      sdk: 'ParaSpellApi',
      tokens: [Polkadot.DOT.id, Polkadot.CFG.id],
    },
    {
      from: Hydration.uid,
      to: Astar.uid,
      sdk: 'ParaSpellApi',
      tokens: [
        Polkadot.DOT.id,
        Polkadot.ASTR.id,
        Polkadot.HDX.id,
        Polkadot.GLMR.id,
        Polkadot.ACA.id,
        Polkadot.INTR.id,
      ],
    },
    {
      from: Astar.uid,
      to: Hydration.uid,
      sdk: 'ParaSpellApi',
      tokens: [
        Polkadot.DOT.id,
        Polkadot.ASTR.id,
        Polkadot.HDX.id,
        Polkadot.GLMR.id,
        Polkadot.ACA.id,
        Polkadot.INTR.id,
      ],
    },
    {
      from: Astar.uid,
      to: Moonbeam.uid,
      sdk: 'ParaSpellApi',
      tokens: [Polkadot.DOT.id, Polkadot.ASTR.id, Polkadot.GLMR.id],
    },
  ],
  assetUid: new Map([
    [
      AssetHub.uid,
      new Map([
        [Eth.USDC.id, { symbol: 'USDC.e' }],
        [Polkadot.USDC.id, { id: '1337' }],
        [Eth.USDT.id, { symbol: 'USDT.e' }],
        [Polkadot.USDT.id, { id: '1984' }],
        [Eth.WETH.id, { symbol: 'WETH.e' }],
        [Eth.WBTC.id, { symbol: 'WBTC.e' }],
      ]),
    ],
    [
      Hydration.uid,
      new Map([
        [Polkadot.USDC.id, { id: '22' }],
        [Polkadot.USDT.id, { id: '10' }],
      ]),
    ],
  ]),
}
