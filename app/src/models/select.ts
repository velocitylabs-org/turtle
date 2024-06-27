import { ReactNode } from 'react'
import { Chain } from '@/models/chain'
import { Token } from '@/models/token'

export interface SelectProps<T> {
  value: T | null
  onChange: (newValue: T | null) => void
  options: T[]
  floatingLabel?: string
  placeholder?: string
  placeholderIcon?: ReactNode
  trailing?: ReactNode
  disabled?: boolean
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
