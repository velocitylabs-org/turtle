import { Token } from '@/models/token'
import { ReactNode } from 'react'

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

export interface ManualAddressValue {
  enabled: boolean
  address: string
}

export interface ManualAddressInput extends ManualAddressValue {
  onChange: (newValue: ManualAddressValue) => void
}

export interface TokenAmount {
  token: Token | null
  /** amount in human readable format */
  amount: number | null
}
