import { Chain } from './chain'
import { Token } from './token'

// TODO: Update the interface once it is more clearly defined
export interface Transfer {
  id: string
  sourceChain: Chain
  token: Token
  sender: string
  destChain: Chain
  amount: bigint
  recipient: string // TODO: Decide to use either string type or create own Address type
  status: string
  date: Date
}
