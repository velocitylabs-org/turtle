import { Chain } from './chain'
import { Token } from './token'

// TODO: Update the interface once it is more clearly defined
export interface Transfer {
  id: string
  txHashes: string[]
  token: Token
  sourceChain: Chain
  destChain: Chain
  amount: bigint
  receiver: string // TODO: Decide to use either string type or create own Address type
  status: string
}
