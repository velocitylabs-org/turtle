import { ComponentPropsWithoutRef } from 'react'
import { colors } from '../../../tailwind.config'

interface CrossProps extends ComponentPropsWithoutRef<'svg'> {
  stroke?: string
}

export default function Cross({
  stroke = colors['turtle-secondary'],
  ...props
}: CrossProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M7 7L17 17" stroke={stroke} strokeLinecap="round" />
      <path d="M17 7L7 17" stroke={stroke} strokeLinecap="round" />
    </svg>
  )
}
