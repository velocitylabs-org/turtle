import { Route } from '..'
import { AssetHub, Bifrost, Ethereum, Hydration, Moonbeam, Mythos } from './chains'
import { Eth } from './tokens'

export const snowbridgeRoutes: Route[] = [
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
]
