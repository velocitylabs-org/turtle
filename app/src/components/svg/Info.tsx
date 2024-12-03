import { ComponentPropsWithoutRef } from 'react'
import { colors } from '../../../tailwind.config'

export const Info = ({
  fill = colors['turtle-tertiary-dark'],
  ...props
}: ComponentPropsWithoutRef<'svg'> & { fill?: string }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect x="2.5" y="2.5" width="19" height="19" rx="3.5" stroke={fill} />
    <path d="M12 17V11.4918L10 11.5" stroke={fill} strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="8" r="1" fill={fill} />
  </svg>
)
