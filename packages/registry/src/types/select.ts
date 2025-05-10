import { Token } from './token'

export interface ManualRecipient {
  enabled: boolean
  address: string
}

export interface ManualRecipientInput extends ManualRecipient {
  onChange: (newValue: ManualRecipient) => void
}

export interface TokenAmount {
  token: Token | null
  /** amount in human readable format */
  amount: number | null
}
