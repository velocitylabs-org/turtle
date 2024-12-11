import { Route } from '..'
import { Acala, Astar, Bifrost, Centrifuge, Hydration, Interlay, Moonbeam } from './chains'
import { Polkadot } from './tokens'

export const paraToParaRoutes: Route[] = [
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
    tokens: [Polkadot.DOT.id, Polkadot.GLMR.id],
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
    tokens: [Polkadot.DOT.id, Polkadot.CFG.id],
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
]
