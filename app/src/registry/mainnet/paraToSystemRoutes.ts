import { Route } from '..'
import { AssetHub, Bifrost, Hydration } from './chains'
import { Eth, Polkadot } from './tokens'

export const paraToSystemRoutes: Route[] = [
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
]
