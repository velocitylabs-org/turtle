import { ReactNode } from 'react'
import { Token } from './token'

export interface SelectProps<T> {
  value: T | null
  onChange: (newValue: T | null) => void
  options: (T & { allowed: boolean })[]
  floatingLabel?: string
  placeholder?: string
  placeholderIcon?: ReactNode
  secondPlaceholder?: string
  trailing?: ReactNode
  disabled?: boolean
  clearable?: boolean
  error?: string
  className?: string
}

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
