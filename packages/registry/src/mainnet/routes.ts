import { Route } from "../types";
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
import { EthereumTokens, PolkadotTokens } from "./tokens";

export const routes: Route[] = [
  // Ethereum -> Polkadot
  {
    from: Ethereum.uid,
    to: AssetHub.uid,
    sdk: "SnowbridgeApi",
    tokens: [
      EthereumTokens.ETH.id,
      EthereumTokens.WETH.id,
      EthereumTokens.WBTC.id,
      EthereumTokens.USDC.id,
      EthereumTokens.USDT.id,
      EthereumTokens.DAI.id,
      EthereumTokens.WSTETH.id,
      EthereumTokens.TBTC.id,
      EthereumTokens.TON.id,
      EthereumTokens.SHIB.id,
      EthereumTokens.PEPE.id,
    ],
  },
  {
    from: Ethereum.uid,
    to: Mythos.uid,
    sdk: "SnowbridgeApi",
    tokens: [EthereumTokens.MYTH.id],
  },
  {
    from: Ethereum.uid,
    to: Moonbeam.uid,
    sdk: "SnowbridgeApi",
    tokens: [EthereumTokens.WETH.id, EthereumTokens.WBTC.id],
  },
  {
    from: Ethereum.uid,
    to: Bifrost.uid,
    sdk: "SnowbridgeApi",
    tokens: [EthereumTokens.ETH.id, EthereumTokens.WETH.id],
  },
  {
    from: Ethereum.uid,
    to: Hydration.uid,
    sdk: "SnowbridgeApi",
    tokens: [
      EthereumTokens.ETH.id,
      EthereumTokens.USDC.id,
      EthereumTokens.USDT.id,
      EthereumTokens.WBTC.id,
    ],
  },
  {
    from: AssetHub.uid,
    to: Ethereum.uid,
    sdk: "ParaSpellApi",
    tokens: [
      EthereumTokens.ETH.id,
      EthereumTokens.WETH.id,
      EthereumTokens.WBTC.id,
      EthereumTokens.USDC.id,
      EthereumTokens.USDT.id,
      EthereumTokens.DAI.id,
      EthereumTokens.WSTETH.id,
      EthereumTokens.TBTC.id,
      EthereumTokens.TON.id,
      EthereumTokens.SHIB.id,
      EthereumTokens.PEPE.id,
    ],
  },

  // Relay To Para Routes
  {
    from: RelayChain.uid,
    to: AssetHub.uid,
    sdk: "ParaSpellApi",
    tokens: [PolkadotTokens.DOT.id],
  },
  {
    from: RelayChain.uid,
    to: Acala.uid,
    sdk: "ParaSpellApi",
    tokens: [PolkadotTokens.DOT.id],
  },
  {
    from: RelayChain.uid,
    to: Moonbeam.uid,
    sdk: "ParaSpellApi",
    tokens: [PolkadotTokens.DOT.id],
  },
  {
    from: RelayChain.uid,
    to: Hydration.uid,
    sdk: "ParaSpellApi",
    tokens: [PolkadotTokens.DOT.id],
  },
  {
    from: RelayChain.uid,
    to: Interlay.uid,
    sdk: "ParaSpellApi",
    tokens: [PolkadotTokens.DOT.id],
  },
  {
    from: RelayChain.uid,
    to: Centrifuge.uid,
    sdk: "ParaSpellApi",
    tokens: [PolkadotTokens.DOT.id],
  },
  {
    from: RelayChain.uid,
    to: Astar.uid,
    sdk: "ParaSpellApi",
    tokens: [PolkadotTokens.DOT.id],
  },
  {
    from: RelayChain.uid,
    to: Bifrost.uid,
    sdk: "ParaSpellApi",
    tokens: [PolkadotTokens.DOT.id],
  },
  {
    from: RelayChain.uid,
    to: Polimec.uid,
    sdk: "ParaSpellApi",
    tokens: [PolkadotTokens.DOT.id],
  },

  // Para To Relay Routes
  {
    from: AssetHub.uid,
    to: RelayChain.uid,
    sdk: "ParaSpellApi",
    tokens: [PolkadotTokens.DOT.id],
  },
  {
    from: Acala.uid,
    to: RelayChain.uid,
    sdk: "ParaSpellApi",
    tokens: [PolkadotTokens.DOT.id],
  },
  {
    from: Bifrost.uid,
    to: RelayChain.uid,
    sdk: "ParaSpellApi",
    tokens: [PolkadotTokens.DOT.id],
  },
  /* {
    from: Interlay.uid,
    to: RelayChain.uid,
    sdk: 'ParaSpellApi',
    tokens: [PolkadotTokens.DOT.id],
  }, */
  {
    from: Moonbeam.uid,
    to: RelayChain.uid,
    sdk: "ParaSpellApi",
    tokens: [PolkadotTokens.DOT.id],
  },
  {
    from: Hydration.uid,
    to: RelayChain.uid,
    sdk: "ParaSpellApi",
    tokens: [PolkadotTokens.DOT.id],
  },
  {
    from: Astar.uid,
    to: RelayChain.uid,
    sdk: "ParaSpellApi",
    tokens: [PolkadotTokens.DOT.id],
  },

  // System To Para Routes
  {
    from: AssetHub.uid,
    to: Bifrost.uid,
    sdk: "ParaSpellApi",
    tokens: [
      PolkadotTokens.USDC.id,
      PolkadotTokens.USDT.id,
      PolkadotTokens.DOT.id,
    ],
  },
  {
    from: AssetHub.uid,
    to: Hydration.uid,
    sdk: "ParaSpellApi",
    tokens: [
      PolkadotTokens.DOT.id,
      PolkadotTokens.USDC.id,
      PolkadotTokens.USDT.id,
      EthereumTokens.WETH.id,
      EthereumTokens.USDC.id,
    ],
  },
  {
    from: AssetHub.uid,
    to: Moonbeam.uid,
    sdk: "ParaSpellApi",
    tokens: [PolkadotTokens.USDC.id, PolkadotTokens.USDT.id],
  },
  {
    from: AssetHub.uid,
    to: Centrifuge.uid,
    sdk: "ParaSpellApi",
    tokens: [PolkadotTokens.USDC.id],
  },
  {
    from: AssetHub.uid,
    to: Mythos.uid,
    sdk: "ParaSpellApi",
    tokens: [EthereumTokens.MYTH.id, PolkadotTokens.MYTH.id],
  },
  {
    from: AssetHub.uid,
    to: Astar.uid,
    sdk: "ParaSpellApi",
    tokens: [PolkadotTokens.USDC.id, PolkadotTokens.USDT.id],
  },
  {
    from: AssetHub.uid,
    to: Polimec.uid,
    sdk: "ParaSpellApi",
    tokens: [
      PolkadotTokens.DOT.id,
      PolkadotTokens.USDC.id,
      PolkadotTokens.USDT.id,
    ],
  },

  // Para to Ethereum
  {
    from: Bifrost.uid,
    to: Ethereum.uid,
    sdk: "ParaSpellApi",
    tokens: [EthereumTokens.ETH.id, EthereumTokens.WETH.id],
  },
  {
    from: Hydration.uid,
    to: Ethereum.uid,
    sdk: "ParaSpellApi",
    tokens: [
      EthereumTokens.ETH.id,
      EthereumTokens.USDC.id,
      EthereumTokens.USDT.id,
      EthereumTokens.WBTC.id,
    ],
  },

  // Para To System
  {
    from: Hydration.uid,
    to: AssetHub.uid,
    sdk: "ParaSpellApi",
    tokens: [
      PolkadotTokens.DOT.id,
      PolkadotTokens.USDC.id,
      PolkadotTokens.USDT.id,
    ],
  },
  {
    from: Bifrost.uid,
    to: AssetHub.uid,
    sdk: "ParaSpellApi",
    tokens: [
      PolkadotTokens.DOT.id,
      PolkadotTokens.USDC.id,
      PolkadotTokens.USDT.id,
    ],
  },
  {
    from: Centrifuge.uid,
    to: AssetHub.uid,
    sdk: "ParaSpellApi",
    tokens: [PolkadotTokens.USDC.id],
  },
  {
    from: Moonbeam.uid,
    to: AssetHub.uid,
    sdk: "ParaSpellApi",
    tokens: [
      PolkadotTokens.USDC.id,
      PolkadotTokens.USDT.id,
      PolkadotTokens.DOT.id,
    ],
  },
  {
    from: Polimec.uid,
    to: AssetHub.uid,
    sdk: "ParaSpellApi",
    tokens: [
      PolkadotTokens.USDC.id,
      PolkadotTokens.USDT.id,
      PolkadotTokens.DOT.id,
    ],
  },
  {
    from: Polimec.uid,
    to: Hydration.uid,
    sdk: "ParaSpellApi",
    tokens: [
      PolkadotTokens.USDC.id,
      PolkadotTokens.USDT.id,
      PolkadotTokens.DOT.id,
    ],
  },

  // Para To Para Routes
  {
    from: Bifrost.uid,
    to: Centrifuge.uid,
    sdk: "ParaSpellApi",
    tokens: [PolkadotTokens.DOT.id],
  },
  {
    from: Bifrost.uid,
    to: Hydration.uid,
    sdk: "ParaSpellApi",
    tokens: [
      PolkadotTokens.DOT.id,
      PolkadotTokens.BNC.id,
      PolkadotTokens.VDOT.id,
    ],
  },
  {
    from: Bifrost.uid,
    to: Moonbeam.uid,
    sdk: "ParaSpellApi",
    tokens: [
      PolkadotTokens.DOT.id,
      PolkadotTokens.BNC.id,
      PolkadotTokens.GLMR.id,
      PolkadotTokens.VDOT.id,
    ],
  },
  {
    from: Bifrost.uid,
    to: Interlay.uid,
    sdk: "ParaSpellApi",
    tokens: [
      PolkadotTokens.DOT.id,
      PolkadotTokens.BNC.id,
      PolkadotTokens.VDOT.id,
    ],
  },
  {
    from: Bifrost.uid,
    to: Acala.uid,
    sdk: "ParaSpellApi",
    tokens: [PolkadotTokens.DOT.id],
  },
  {
    from: Bifrost.uid,
    to: Astar.uid,
    sdk: "ParaSpellApi",
    tokens: [PolkadotTokens.DOT.id],
  },
  {
    from: Moonbeam.uid,
    to: Hydration.uid,
    sdk: "ParaSpellApi",
    tokens: [
      PolkadotTokens.DOT.id,
      PolkadotTokens.GLMR.id,
      PolkadotTokens.VDOT.id,
    ],
  },
  {
    from: Moonbeam.uid,
    to: Acala.uid,
    sdk: "ParaSpellApi",
    tokens: [PolkadotTokens.DOT.id],
  },
  {
    from: Moonbeam.uid,
    to: Centrifuge.uid,
    sdk: "ParaSpellApi",
    tokens: [PolkadotTokens.DOT.id],
  },
  {
    from: Moonbeam.uid,
    to: Astar.uid,
    sdk: "ParaSpellApi",
    tokens: [PolkadotTokens.DOT.id],
  },
  {
    from: Moonbeam.uid,
    to: Bifrost.uid,
    sdk: "ParaSpellApi",
    tokens: [PolkadotTokens.DOT.id],
  },
  {
    from: Moonbeam.uid,
    to: Interlay.uid,
    sdk: "ParaSpellApi",
    tokens: [PolkadotTokens.DOT.id],
  },
  {
    from: Acala.uid,
    to: Hydration.uid,
    sdk: "ParaSpellApi",
    tokens: [PolkadotTokens.ACA.id, PolkadotTokens.DOT.id],
  },
  {
    from: Acala.uid,
    to: Moonbeam.uid,
    sdk: "ParaSpellApi",
    tokens: [PolkadotTokens.DOT.id],
  },
  {
    from: Hydration.uid,
    to: Moonbeam.uid,
    sdk: "ParaSpellApi",
    tokens: [
      PolkadotTokens.DOT.id,
      PolkadotTokens.HDX.id,
      PolkadotTokens.GLMR.id,
      PolkadotTokens.BNC.id,
      PolkadotTokens.VDOT.id,
    ],
  },
  {
    from: Hydration.uid,
    to: Bifrost.uid,
    sdk: "ParaSpellApi",
    tokens: [
      PolkadotTokens.DOT.id,
      PolkadotTokens.BNC.id,
      PolkadotTokens.VDOT.id,
    ],
  },
  {
    from: Hydration.uid,
    to: Phala.uid,
    sdk: "ParaSpellApi",
    tokens: [PolkadotTokens.PHA.id],
  },
  {
    from: Hydration.uid,
    to: Polimec.uid,
    sdk: "ParaSpellApi",
    tokens: [
      PolkadotTokens.USDC.id,
      PolkadotTokens.USDT.id,
      PolkadotTokens.DOT.id,
    ],
  },
  /* {
    from: Interlay.uid,
    to: Hydration.uid,
    sdk: 'ParaSpellApi',
    tokens: [PolkadotTokens.DOT.id, PolkadotTokens.VDOT.id, PolkadotTokens.INTR.id, PolkadotTokens.IBTC.id],
  }, */
  {
    from: Hydration.uid,
    to: Interlay.uid,
    sdk: "ParaSpellApi",
    tokens: [
      PolkadotTokens.DOT.id,
      PolkadotTokens.INTR.id,
      PolkadotTokens.HDX.id,
      PolkadotTokens.VDOT.id,
      PolkadotTokens.IBTC.id,
    ],
  },
  {
    from: Hydration.uid,
    to: Acala.uid,
    sdk: "ParaSpellApi",
    tokens: [
      PolkadotTokens.DOT.id,
      PolkadotTokens.ACA.id,
      PolkadotTokens.HDX.id,
    ],
  },
  {
    from: Hydration.uid,
    to: Centrifuge.uid,
    sdk: "ParaSpellApi",
    tokens: [
      PolkadotTokens.DOT.id,
      PolkadotTokens.CFG.id,
      PolkadotTokens.GLMR.id,
    ],
  },
  {
    from: Hydration.uid,
    to: Astar.uid,
    sdk: "ParaSpellApi",
    tokens: [
      PolkadotTokens.DOT.id,
      PolkadotTokens.ASTR.id,
      PolkadotTokens.HDX.id,
      PolkadotTokens.GLMR.id,
      PolkadotTokens.ACA.id,
      PolkadotTokens.INTR.id,
    ],
  },
  {
    from: Astar.uid,
    to: Hydration.uid,
    sdk: "ParaSpellApi",
    tokens: [
      PolkadotTokens.DOT.id,
      PolkadotTokens.ASTR.id,
      PolkadotTokens.HDX.id,
      PolkadotTokens.GLMR.id,
      PolkadotTokens.ACA.id,
      PolkadotTokens.INTR.id,
    ],
  },
  {
    from: Astar.uid,
    to: Moonbeam.uid,
    sdk: "ParaSpellApi",
    tokens: [
      PolkadotTokens.DOT.id,
      PolkadotTokens.ASTR.id,
      PolkadotTokens.GLMR.id,
    ],
  },
  {
    from: Astar.uid,
    to: Acala.uid,
    sdk: "ParaSpellApi",
    tokens: [PolkadotTokens.DOT.id],
  },
  {
    from: Astar.uid,
    to: Bifrost.uid,
    sdk: "ParaSpellApi",
    tokens: [PolkadotTokens.DOT.id],
  },
  {
    from: Astar.uid,
    to: Interlay.uid,
    sdk: "ParaSpellApi",
    tokens: [PolkadotTokens.DOT.id],
  },
  {
    from: Astar.uid,
    to: Centrifuge.uid,
    sdk: "ParaSpellApi",
    tokens: [PolkadotTokens.DOT.id],
  },
  {
    from: Mythos.uid,
    to: AssetHub.uid,
    sdk: "ParaSpellApi",
    tokens: [PolkadotTokens.MYTH.id],
  },
  {
    from: Mythos.uid,
    to: Ethereum.uid,
    sdk: "ParaSpellApi",
    tokens: [EthereumTokens.MYTH.id],
  },
  {
    from: Mythos.uid,
    to: Hydration.uid,
    sdk: "ParaSpellApi",
    tokens: [EthereumTokens.MYTH.id],
  },
  {
    from: Hydration.uid,
    to: Mythos.uid,
    sdk: "ParaSpellApi",
    tokens: [EthereumTokens.MYTH.id],
  },
  {
    from: Centrifuge.uid,
    to: Hydration.uid,
    sdk: "ParaSpellApi",
    tokens: [
      PolkadotTokens.DOT.id,
      PolkadotTokens.CFG.id,
      PolkadotTokens.GLMR.id,
    ],
  },
  {
    from: Centrifuge.uid,
    to: Moonbeam.uid,
    sdk: "ParaSpellApi",
    tokens: [PolkadotTokens.DOT.id],
  },
  {
    from: Phala.uid,
    to: Hydration.uid,
    sdk: "ParaSpellApi",
    tokens: [PolkadotTokens.PHA.id],
  },
];
