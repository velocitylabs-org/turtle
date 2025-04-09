import { ReactNode } from 'react'
import { Token } from '@/models/token'

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

export interface TokenAmount {
  token: Token | null
  amount: number | null
}
