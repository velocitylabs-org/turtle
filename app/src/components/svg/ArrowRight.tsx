import { colors } from '@velocitylabs-org/turtle-tailwind-config'
import type { ComponentPropsWithoutRef } from 'react'

interface ArrowRightProps extends ComponentPropsWithoutRef<'svg'> {
  fill?: string
}

export default function ArrowRight({ fill = colors['turtle-foreground'], ...props }: ArrowRightProps) {
  return (
    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 7.33334L8.66667 4M8.66667 4L4 0.666669M8.66667 4L1 4"
        stroke={fill}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
