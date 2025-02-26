import { cn } from '@/lib/utils'
import { FC } from 'react'

const VerticalDivider: FC<{ className?: string }> = className => (
  <div className={cn('ml-2 h-[1.625rem] border-1 border-turtle-level3', className)} />
)

export default VerticalDivider
