import type { ComponentPropsWithoutRef } from 'react'
import { colors } from '../../../tailwind.config'

interface SwapProps extends ComponentPropsWithoutRef<'svg'> {
  fill?: string
}

export default function Swap({ fill = colors['turtle-level6'], ...props }: SwapProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="6.5" cy="6.5" r="1.5" fill={fill} />
      <rect x="16" y="16" width="3" height="3" rx="1" fill={fill} />
      <path d="M13 17.5L8.5 17.5C7.39543 17.5 6.5 16.6046 6.5 15.5V10.5" stroke={fill} strokeLinecap="round" />
      <path d="M11 6.5L15.5 6.5C16.6046 6.5 17.5 7.39543 17.5 8.5V13.5" stroke={fill} strokeLinecap="round" />
      <path d="M14.5 11.5L17.5 13.5" stroke={fill} strokeLinecap="round" />
      <path d="M9.5 12.5L6.5 10.5" stroke={fill} strokeLinecap="round" />
      <path d="M20.5 11.5L17.5 13.5" stroke={fill} strokeLinecap="round" />
      <path d="M3.5 12.5L6.5 10.5" stroke={fill} strokeLinecap="round" />
    </svg>
  )
}
