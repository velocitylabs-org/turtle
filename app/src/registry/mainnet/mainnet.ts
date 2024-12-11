import { Registry } from '..'
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
  Polimec,
  RelayChain,
} from './chains'
import { routes } from './routes'
import { Eth, Polkadot } from './tokens'

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
  routes,
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
