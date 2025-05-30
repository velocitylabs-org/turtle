import acalaLogo from "@velocitylabs-org/turtle-assets/logos/acala.svg";
import astarLogo from "@velocitylabs-org/turtle-assets/logos/astar.svg";
import bifrostLogo from "@velocitylabs-org/turtle-assets/logos/bifrost.svg";
import cfgLogo from "@velocitylabs-org/turtle-assets/logos/cfg.svg";
import daiLogo from "@velocitylabs-org/turtle-assets/logos/dai.svg";
import ethereumLogo from "@velocitylabs-org/turtle-assets/logos/ethereum.svg";
import hydraLogo from "@velocitylabs-org/turtle-assets/logos/hydra.svg";
import ibtcLogo from "@velocitylabs-org/turtle-assets/logos/ibtc.svg";
import interlayLogo from "@velocitylabs-org/turtle-assets/logos/interlay.svg";
import moonbeamLogo from "@velocitylabs-org/turtle-assets/logos/moonbeam.svg";
import mythLogo from "@velocitylabs-org/turtle-assets/logos/myth.svg";
import pepeLogo from "@velocitylabs-org/turtle-assets/logos/pepe.svg";
import phalaLogo from "@velocitylabs-org/turtle-assets/logos/phala.svg";
import polimecLogo from "@velocitylabs-org/turtle-assets/logos/polimec.svg";
import polkadotLogo from "@velocitylabs-org/turtle-assets/logos/polkadot.svg";
import shibLogo from "@velocitylabs-org/turtle-assets/logos/shib.svg";
import tbtcLogo from "@velocitylabs-org/turtle-assets/logos/tbtc.svg";
import tonLogo from "@velocitylabs-org/turtle-assets/logos/ton.svg";
import usdcLogo from "@velocitylabs-org/turtle-assets/logos/usdc.svg";
import usdtLogo from "@velocitylabs-org/turtle-assets/logos/usdt.svg";
import vdotLogo from "@velocitylabs-org/turtle-assets/logos/vdot.svg";
import vethLogo from "@velocitylabs-org/turtle-assets/logos/veth.svg";
import wbtcLogo from "@velocitylabs-org/turtle-assets/logos/wbtc.svg";
import wethLogo from "@velocitylabs-org/turtle-assets/logos/weth.svg";
import wstethLogo from "@velocitylabs-org/turtle-assets/logos/wsteth.svg";

import { parachain, snowbridgeWrapped } from "../helpers";
import { Token } from "../types";
// Tokens
export const EthereumTokens = {
  ETH: {
    id: "eth",
    name: "Ethereum",
    symbol: "ETH",
    logoURI: ethereumLogo,
    decimals: 18,
    address: "0x0000000000000000000000000000000000000000",
    multilocation: {
      parents: 2,
      interior: {
        X1: {
          GlobalConsensus: {
            Ethereum: {
              chainId: 1,
            },
          },
        },
      },
    },
    coingeckoId: "ethereum",
    origin: snowbridgeWrapped(),
  },

  // Snowbridge-wrapped USDC
  USDC: {
    id: "usdc.e",
    name: "USDC",
    symbol: "USDC",
    logoURI: usdcLogo,
    decimals: 6,
    address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    multilocation: {
      parents: 2,
      interior: {
        X2: [
          {
            GlobalConsensus: {
              Ethereum: {
                chainId: 1,
              },
            },
          },
          {
            AccountKey20: {
              network: null,
              key: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            },
          },
        ],
      },
    },
    origin: snowbridgeWrapped(),
    coingeckoId: "usd-coin",
  },

  DAI: {
    id: "dai.e",
    name: "DAI",
    symbol: "DAI",
    logoURI: daiLogo,
    decimals: 18,
    address: "0x6b175474e89094c44da98b954eedeac495271d0f",
    multilocation: {
      parents: 2,
      interior: {
        X2: [
          {
            GlobalConsensus: {
              Ethereum: {
                chainId: 1,
              },
            },
          },
          {
            AccountKey20: {
              network: null,
              key: "0x6b175474e89094c44da98b954eedeac495271d0f",
            },
          },
        ],
      },
    },
    origin: snowbridgeWrapped(),
  },

  USDT: {
    id: "usdt.e",
    name: "Tether",
    symbol: "USDT",
    logoURI: usdtLogo,
    decimals: 6,
    address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    multilocation: {
      parents: 2,
      interior: {
        X2: [
          {
            GlobalConsensus: {
              Ethereum: {
                chainId: 1,
              },
            },
          },
          {
            AccountKey20: {
              network: null,
              key: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            },
          },
        ],
      },
    },

    origin: snowbridgeWrapped(),
  },

  WETH: {
    id: "weth.e",
    name: "Wrapped Ether",
    symbol: "wETH",
    logoURI: wethLogo,
    decimals: 18,
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    multilocation: {
      parents: 2,
      interior: {
        X2: [
          {
            GlobalConsensus: {
              Ethereum: {
                chainId: 1,
              },
            },
          },
          {
            AccountKey20: {
              network: null,
              key: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            },
          },
        ],
      },
    },
    coingeckoId: "weth",
    origin: snowbridgeWrapped(),
  },

  VETH: {
    id: "veth.e",
    name: "Venus ETH",
    symbol: "vETH",
    logoURI: vethLogo,
    decimals: 18,
    address: "0xc3d088842dcf02c13699f936bb83dfbbc6f721ab",
    multilocation: {
      parents: 2,
      interior: {
        X2: [
          {
            GlobalConsensus: {
              Ethereum: {
                chainId: 1,
              },
            },
          },
          {
            AccountKey20: {
              network: null,
              key: "0xc3d088842dcf02c13699f936bb83dfbbc6f721ab",
            },
          },
        ],
      },
    },
    origin: snowbridgeWrapped(),
  },

  WBTC: {
    id: "wbtc.e",
    name: "Wrapped Bitcoin",
    symbol: "WBTC",
    logoURI: wbtcLogo,
    decimals: 8,
    address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    multilocation: {
      parents: 2,
      interior: {
        X2: [
          {
            GlobalConsensus: {
              Ethereum: {
                chainId: 1,
              },
            },
          },
          {
            AccountKey20: {
              network: null,
              key: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
            },
          },
        ],
      },
    },
    origin: snowbridgeWrapped(),
  },

  MYTH: {
    id: "myth.e",
    name: "Mythos",
    symbol: "MYTH",
    logoURI: mythLogo,
    decimals: 18,
    address: "0xba41ddf06b7ffd89d1267b5a93bfef2424eb2003",
    multilocation: {
      parents: 2,
      interior: {
        X2: [
          {
            GlobalConsensus: {
              Ethereum: {
                chainId: 1,
              },
            },
          },
          {
            AccountKey20: {
              network: null,
              key: "0xba41ddf06b7ffd89d1267b5a93bfef2424eb2003",
            },
          },
        ],
      },
    },
    coingeckoId: "mythos",
    origin: snowbridgeWrapped(),
  },

  SHIB: {
    id: "shib.e",
    name: "Shiba Inu",
    symbol: "SHIB",
    logoURI: shibLogo,
    decimals: 18,
    address: "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce",
    multilocation: {
      parents: 2,
      interior: {
        X2: [
          {
            GlobalConsensus: {
              Ethereum: {
                chainId: 1,
              },
            },
          },
          {
            AccountKey20: {
              network: null,
              key: "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce",
            },
          },
        ],
      },
    },
    origin: snowbridgeWrapped(),
  },

  PEPE: {
    id: "pepe.e",
    name: "Pepe",
    symbol: "PEPE",
    logoURI: pepeLogo,
    decimals: 18,
    address: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
    multilocation: {
      parents: 2,
      interior: {
        X2: [
          {
            GlobalConsensus: {
              Ethereum: {
                chainId: 1,
              },
            },
          },
          {
            AccountKey20: {
              network: null,
              key: "0x6982508145454ce325ddbe47a25d4ec3d2311933",
            },
          },
        ],
      },
    },
    origin: snowbridgeWrapped(),
  },

  TON: {
    id: "ton.e",
    name: "Toncoin",
    symbol: "TON",
    logoURI: tonLogo,
    decimals: 9,
    address: "0x582d872a1b094fc48f5de31d3b73f2d9be47def1",
    multilocation: {
      parents: 2,
      interior: {
        X2: [
          {
            GlobalConsensus: {
              Ethereum: {
                chainId: 1,
              },
            },
          },
          {
            AccountKey20: {
              network: null,
              key: "0x582d872a1b094fc48f5de31d3b73f2d9be47def1",
            },
          },
        ],
      },
    },
    coingeckoId: "the-open-network",
    origin: snowbridgeWrapped(),
  },

  WSTETH: {
    id: "wsteth.e",
    name: "Lido wstETH",
    symbol: "WSTETH",
    logoURI: wstethLogo,
    decimals: 18,
    address: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0",
    multilocation: {
      parents: 2,
      interior: {
        X2: [
          {
            GlobalConsensus: {
              Ethereum: {
                chainId: 1,
              },
            },
          },
          {
            AccountKey20: {
              network: null,
              key: "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0",
            },
          },
        ],
      },
    },
    coingeckoId: "bridged-wrapped-lido-staked-ether-scroll",
    origin: snowbridgeWrapped(),
  },

  TBTC: {
    id: "tbtc.e",
    name: "tBTC",
    symbol: "TBTC",
    logoURI: tbtcLogo,
    decimals: 18,
    address: "0x18084fbA666a33d37592fA2633fD49a74DD93a88",
    multilocation: {
      parents: 2,
      interior: {
        X2: [
          {
            GlobalConsensus: {
              Ethereum: {
                chainId: 1,
              },
            },
          },
          {
            AccountKey20: {
              network: null,
              key: "0x18084fba666a33d37592fa2633fd49a74dd93a88",
            },
          },
        ],
      },
    },
    origin: snowbridgeWrapped(),
  },
} as const satisfies Record<string, Token>;

export const PolkadotTokens = {
  ACA: {
    id: "aca",
    name: "Acala Token",
    symbol: "ACA",
    logoURI: acalaLogo,
    decimals: 12,
    address: "",
    multilocation: {
      parents: 1,
      interior: {
        X2: [
          {
            Parachain: 2000,
          },
          {
            GeneralKey: {
              length: 2,
              data: "0x0000000000000000000000000000000000000000000000000000000000000000",
            },
          },
        ],
      },
    },
    coingeckoId: "acala",
    origin: parachain(2000),
  },

  ASTR: {
    id: "astr",
    name: "ASTR",
    symbol: "ASTR",
    logoURI: astarLogo,
    decimals: 18,
    address: "",
    multilocation: {
      parents: 1,
      interior: {
        X1: {
          Parachain: 2006,
        },
      },
    },
    coingeckoId: "astar",
    origin: parachain(2006),
  },

  BNC: {
    id: "bnc",
    name: "Bifrost Native Coin",
    symbol: "BNC",
    logoURI: bifrostLogo,
    decimals: 12,
    address: "",
    multilocation: {
      parents: 1,
      interior: {
        X2: [
          {
            Parachain: 2030,
          },
          {
            GeneralKey: {
              length: 2,
              data: "0x0001000000000000000000000000000000000000000000000000000000000000",
            },
          },
        ],
      },
    },
    coingeckoId: "bifrost-native-coin",
    origin: parachain(2030),
  },

  CFG: {
    id: "cfg",
    name: "Centrifuge",
    symbol: "CFG",
    logoURI: cfgLogo,
    decimals: 18,
    address: "",
    multilocation: {
      parents: 1,
      interior: {
        X2: [
          {
            Parachain: 2031,
          },
          {
            GeneralKey: {
              length: 2,
              data: "0x0001000000000000000000000000000000000000000000000000000000000000",
            },
          },
        ],
      },
    },
    coingeckoId: "centrifuge",
    origin: parachain(2031),
  },

  HDX: {
    id: "hdx",
    name: "Hydration",
    symbol: "HDX",
    logoURI: hydraLogo,
    decimals: 12,
    address: "",
    multilocation: {
      parents: 1,
      interior: {
        X2: [
          {
            Parachain: 2034,
          },
          {
            GeneralIndex: 0,
          },
        ],
      },
    },
    coingeckoId: "hydradx",
    origin: parachain(2034),
  },

  // Polkadot-native USDC
  USDC: {
    id: "usdc",
    name: "USDC",
    symbol: "USDC",
    logoURI: usdcLogo,
    decimals: 6,
    address: "",
    multilocation: {
      parents: 1,
      interior: {
        X3: [
          {
            Parachain: 1000,
          },
          {
            PalletInstance: 50,
          },
          {
            GeneralIndex: 1337,
          },
        ],
      },
    },
    origin: parachain(1000),
    coingeckoId: "usd-coin",
  },

  // Polkadot-native USDT
  USDT: {
    id: "usdt",
    name: "Tether",
    symbol: "USDT",
    logoURI: usdtLogo,
    decimals: 6,
    address: "",
    multilocation: {
      parents: 1,
      interior: {
        X3: [
          {
            Parachain: 1000,
          },
          {
            PalletInstance: 50,
          },
          {
            GeneralIndex: 1984,
          },
        ],
      },
    },
    origin: parachain(1000),
  },

  GLMR: {
    id: "glmr",
    name: "GLMR",
    symbol: "GLMR",
    logoURI: moonbeamLogo,
    decimals: 18,
    address: "",
    multilocation: {
      parents: 1,
      interior: {
        X2: [
          {
            Parachain: 2004,
          },
          {
            PalletInstance: 10,
          },
        ],
      },
    },
    coingeckoId: "moonbeam",
    origin: parachain(2004),
  },

  PHA: {
    id: "pha",
    name: "PHA",
    symbol: "PHA",
    logoURI: phalaLogo,
    decimals: 12,
    address: "",
    multilocation: {
      parents: 1,
      interior: {
        X1: {
          Parachain: 2035,
        },
      },
    },
    coingeckoId: "pha",
    origin: parachain(2035),
  },

  INTR: {
    id: "intr",
    name: "Interlay",
    symbol: "INTR",
    logoURI: interlayLogo,
    decimals: 10,
    address: "",
    multilocation: {
      parents: 1,
      interior: {
        X2: [
          {
            Parachain: 2032,
          },
          {
            GeneralKey: {
              length: 2,
              data: "0x0002000000000000000000000000000000000000000000000000000000000000",
            },
          },
        ],
      },
    },
    coingeckoId: "interlay",
    origin: parachain(2032),
  },

  DOT: {
    id: "dot",
    name: "Polkadot",
    logoURI: polkadotLogo,
    symbol: "DOT",
    decimals: 10,
    address: "",
    multilocation: {
      parents: 1,
      interior: {
        Here: null,
      },
    },
    coingeckoId: "polkadot",
    origin: parachain(0),
  },

  VDOT: {
    id: "vdot",
    name: "Voucher DOT",
    symbol: "VDOT",
    logoURI: vdotLogo,
    decimals: 10,
    address: "",
    multilocation: {
      parents: 1,
      interior: {
        X2: [
          {
            Parachain: 2030,
          },
          {
            GeneralKey: {
              length: 2,
              data: "0x0900000000000000000000000000000000000000000000000000000000000000",
            },
          },
        ],
      },
    },
    coingeckoId: "voucher-dot",
    origin: parachain(2030),
  },

  IBTC: {
    id: "ibtc",
    name: "IBTC",
    symbol: "IBTC",
    logoURI: ibtcLogo,
    decimals: 8,
    address: "",
    multilocation: {
      parents: 1,
      interior: {
        X2: [
          {
            Parachain: 2032,
          },
          {
            GeneralKey: {
              length: 2,
              data: "0x0001000000000000000000000000000000000000000000000000000000000000",
            },
          },
        ],
      },
    },
    coingeckoId: "interbtc",
    origin: parachain(2032),
  },

  PLMC: {
    id: "plmc",
    name: "PLMC",
    symbol: "PLMC",
    logoURI: polimecLogo,
    decimals: 10,
    address: "",
    multilocation: {
      parents: 1,
      interior: {
        X1: {
          Parachain: 3344,
        },
      },
    },
    coingeckoId: "polimec",
    origin: parachain(3344),
  },

  MYTH: {
    id: "myth.p",
    name: "Mythos",
    symbol: "MYTH",
    logoURI: mythLogo,
    decimals: 18,
    address: "",
    multilocation: {
      parents: 1,
      interior: {
        X1: {
          Parachain: 3369,
        },
      },
    },
    coingeckoId: "mythos",
    origin: parachain(3369),
  },
} as const satisfies Record<string, Token>;
