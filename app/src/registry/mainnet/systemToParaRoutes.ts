import { Route } from '..'
import { AssetHub, Bifrost, Hydration, Moonbeam } from './chains'
import { Eth, Polkadot } from './tokens'

export const systemToParaRoutes: Route[] = [
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
]
