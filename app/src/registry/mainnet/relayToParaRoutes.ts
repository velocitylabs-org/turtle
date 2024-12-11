import { Route } from '..'
import {
  Acala,
  AssetHub,
  Astar,
  Bifrost,
  Centrifuge,
  Hydration,
  Interlay,
  Moonbeam,
  RelayChain,
} from './chains'
import { Polkadot } from './tokens'

export const relayToParaRoutes: Route[] = [
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
]
