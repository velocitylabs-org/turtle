import { Registry } from "../types";
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
  RelayChain,
} from "./chains";
import { routes } from "./routes";
import { EthereumTokens, PolkadotTokens } from "./tokens";

/* Mainnet :: Polkadot - Ethereum */

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
    Phala,
    Interlay,
    Polimec,
    Centrifuge,
    Astar,
  ],
  tokens: [
    EthereumTokens.ETH,
    EthereumTokens.WETH,
    EthereumTokens.WBTC,
    EthereumTokens.USDC,
    PolkadotTokens.USDC,
    EthereumTokens.USDT,
    PolkadotTokens.USDT,
    EthereumTokens.WSTETH,
    EthereumTokens.TBTC,
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
    EthereumTokens.MYTH,
    PolkadotTokens.HDX,
    EthereumTokens.TON,
    EthereumTokens.SHIB,
    EthereumTokens.PEPE,
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

export * as Mainnet from "./mainnet";
