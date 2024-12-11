import { Route } from '..'
import { Acala, AssetHub, Bifrost, Interlay, Moonbeam, RelayChain } from './chains'
import { Polkadot } from './tokens'

export const paraToRelayRoutes: Route[] = [
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
]
