import { Route } from '..'
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
  RelayChain,
} from './chains'
import { Eth, Polkadot } from './tokens'

export const routes: Route[] = [
  // Snowbridge Routes
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

  // Relay To Para Routes
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

  // Para To Relay Routes
  {
    from: AssetHub.uid,
    to: RelayChain.uid,
    sdk: 'ParaSpellApi',
    tokens: [Polkadot.DOT.id],
  },
  {
    from: Acala.uid,
    to: RelayChain.uid,
    sdk: 'ParaSpellApi',
    tokens: [Polkadot.DOT.id],
  },
  {
    from: Bifrost.uid,
    to: RelayChain.uid,
    sdk: 'ParaSpellApi',
    tokens: [Polkadot.DOT.id],
  },
  {
    from: Interlay.uid,
    to: RelayChain.uid,
    sdk: 'ParaSpellApi',
    tokens: [Polkadot.DOT.id],
  },
  {
    from: Moonbeam.uid,
    to: RelayChain.uid,
    sdk: 'ParaSpellApi',
    tokens: [Polkadot.DOT.id],
  },
  {
    from: Hydration.uid,
    to: RelayChain.uid,
    sdk: 'ParaSpellApi',
    tokens: [Polkadot.DOT.id],
  },

  // System To Para Routes
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
    from: AssetHub.uid,
    to: Centrifuge.uid,
    sdk: 'ParaSpellApi',
    tokens: [Polkadot.USDC.id],
  },
  {
    from: AssetHub.uid,
    to: Mythos.uid,
    sdk: 'ParaSpellApi',
    tokens: [Eth.MYTH.id],
  },

  // Para To System Routes
  {
    from: Hydration.uid,
    to: AssetHub.uid,
    sdk: 'ParaSpellApi',
    tokens: [Polkadot.DOT.id, Polkadot.USDC.id, Polkadot.USDT.id],
  },
  {
    from: Bifrost.uid,
    to: AssetHub.uid,
    sdk: 'ParaSpellApi',
    tokens: [Polkadot.DOT.id, Eth.WETH.id, Polkadot.USDC.id, Polkadot.USDT.id],
  },
  {
    from: Centrifuge.uid,
    to: AssetHub.uid,
    sdk: 'ParaSpellApi',
    tokens: [Polkadot.USDC.id],
  },
  {
    from: Mythos.uid,
    to: AssetHub.uid,
    sdk: 'ParaSpellApi',
    tokens: [Eth.MYTH.id],
  },
  {
    from: Moonbeam.uid,
    to: AssetHub.uid,
    sdk: 'ParaSpellApi',
    tokens: [Polkadot.USDC.id, Polkadot.USDT.id],
  },

  // Para To Para Routes
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
    from: Moonbeam.uid,
    to: Hydration.uid,
    sdk: 'ParaSpellApi',
    tokens: [
      Polkadot.DOT.id,
      Polkadot.GLMR.id,
      // TODO: Works, but tracking doesn't!
      // Polkadot.VDOT.id
    ],
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
    tokens: [Polkadot.DOT.id, Polkadot.HDX.id, Polkadot.GLMR.id, Polkadot.BNC.id, Polkadot.VDOT.id],
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
    tokens: [Polkadot.DOT.id, Polkadot.CFG.id, Polkadot.GLMR.id],
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
  {
    from: Mythos.uid,
    to: Hydration.uid,
    sdk: 'ParaSpellApi',
    tokens: [Eth.MYTH.id],
  },
  {
    from: Hydration.uid,
    to: Mythos.uid,
    sdk: 'ParaSpellApi',
    tokens: [Eth.MYTH.id],
  },
  {
    from: Centrifuge.uid,
    to: Hydration.uid,
    sdk: 'ParaSpellApi',
    tokens: [Polkadot.DOT.id, Polkadot.CFG.id, Polkadot.GLMR.id], 
  },
]
