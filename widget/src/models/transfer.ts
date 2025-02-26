import { Token } from './token'

export interface AmountInfo {
  /* The amount in the `token` currency */
  amount: string | bigint | number
  /* the token  */
  token: Token
  /* the amount converted to USD dollars */
  inDollars: number
}
