import { Chain } from './chain'
import { Token } from './token'
import * as Snowbridge from '@snowbridge/api'

// TODO: Update the interface once it is more clearly defined
export interface Transfer {
  // Params
  id: string
  sourceChain: Chain
  token: Token
  sender: string
  destChain: Chain
  amount: bigint
  recipient: string // TODO: Decide to use either string type or create own Address type
  date: Date

  // Contextual
  context: Snowbridge.Context
  // TODO(nuno): we can have multiple types of transfer and have this depend on that type.
  // that way we can support different fields, for example for xcm-only transfers in the future.
  sendResult: Snowbridge.toEthereum.SendResult | Snowbridge.toPolkadot.SendResult
}
