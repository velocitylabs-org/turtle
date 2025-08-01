import { Registry } from "..";
import {
  Acala,
  AssetHub,
  Astar,
  Bifrost,
  Centrifuge,
  Ethereum,
  Hydration,
  Interlay,
  Moonbeam,
  Mythos,
  Phala,
  Polimec,
  Polkadot,
  KusamaAssetHub,
  Kusama,
} from "./chains";
import { routes } from "./routes";
import { EthereumTokens, PolkadotTokens } from "./tokens";

/* Mainnet :: Polkadot - Ethereum */

// Assembling the Mainnet registry
export const MainnetRegistry: Registry = {
  chains: [
    Ethereum,
    AssetHub,
    Polkadot,
    Bifrost,
    Mythos,
    Hydration,
    Acala,
    Moonbeam,
    Phala,
    Interlay,
    Polimec,
    Centrifuge,
    Astar,
    Kusama,
    KusamaAssetHub,
  ],
  tokens: [
    EthereumTokens.ETH,
    EthereumTokens.WETH,
    EthereumTokens.WBTC,
    EthereumTokens.USDC,
    EthereumTokens.USDT,
    EthereumTokens.WSTETH,
    EthereumTokens.MYTH,
    EthereumTokens.TON,
    EthereumTokens.SHIB,
    EthereumTokens.PEPE,
    EthereumTokens.TBTC,

    PolkadotTokens.USDT,
    PolkadotTokens.USDC,
    PolkadotTokens.AUSDT,
    PolkadotTokens.DOT,
    EthereumTokens.DAI,
    PolkadotTokens.ACA,
    PolkadotTokens.CFG,
    PolkadotTokens.BNC,
    PolkadotTokens.GLMR,
    PolkadotTokens.PHA,
    PolkadotTokens.ASTR,
    PolkadotTokens.INTR,
    PolkadotTokens.PLMC,
    PolkadotTokens.VDOT,
    PolkadotTokens.IBTC,
    PolkadotTokens.MYTH,
    PolkadotTokens.HDX,
    PolkadotTokens.KSM,
  ],
  routes,
  assetUid: new Map([
    [
      AssetHub.uid,
      new Map([
        [EthereumTokens.USDC.id, { symbol: "USDC.e" }],
        [PolkadotTokens.USDC.id, { id: "1337" }],
        [EthereumTokens.USDT.id, { symbol: "USDT.e" }],
        [PolkadotTokens.USDT.id, { id: "1984" }],
        [EthereumTokens.WETH.id, { symbol: "WETH.e" }],
        [EthereumTokens.WBTC.id, { symbol: "WBTC.e" }],
      ]),
    ],
    [
      Hydration.uid,
      new Map([
        [EthereumTokens.WETH.id, { id: "1000189" }],
        [EthereumTokens.USDC.id, { id: "1000766" }],

        [PolkadotTokens.USDC.id, { id: "22" }],
        [PolkadotTokens.USDT.id, { id: "10" }],
      ]),
    ],
  ]),
};
