import { colors } from '@velocitylabs-org/turtle-tailwind-config'
import type { ComponentPropsWithoutRef } from 'react'

interface ExclamationMarkSimpleProps extends ComponentPropsWithoutRef<'svg'> {
  fill?: string
}

export default function ExclamationMarkSimple({
  fill = colors['turtle-primary-dark'],
  ...props
}: ExclamationMarkSimpleProps) {
  return (
    <svg width="4" height="12" viewBox="0 0 4 12" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.679117 2.25589C0.554886 1.42026 1.17966 0.666656 1.99666 0.666656C2.81367 0.666656 3.43844 1.42026 3.31421 2.25589L2.4818 7.855C2.44496 8.10279 2.23893 8.2857 1.99666 8.2857C1.7544 8.2857 1.54837 8.10279 1.51153 7.855L0.679117 2.25589Z"
        fill={fill}
      />
      <ellipse cx="1.99664" cy="10.3174" rx="0.981684" ry="1.01587" fill={fill} />
    </svg>
  )
}
