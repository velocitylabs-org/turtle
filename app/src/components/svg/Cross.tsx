import { colors } from '@velocitylabs-org/turtle-tailwind-config'
import type { ComponentPropsWithoutRef } from 'react'

interface CrossProps extends ComponentPropsWithoutRef<'svg'> {
  stroke?: string
}

export default function Cross({ stroke = colors['turtle-secondary'], ...props }: CrossProps) {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M7.33331 0.666687L0.666647 7.33335" stroke={stroke} stroke-linecap="round" />
      <path d="M0.666687 0.666687L7.33335 7.33335" stroke={stroke} stroke-linecap="round" />
    </svg>
  )
}
