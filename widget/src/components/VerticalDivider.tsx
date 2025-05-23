import { cn } from '@velocitylabs-org/turtle-ui'
import { FC } from 'react'

const VerticalDivider: FC<{ className?: string }> = className => (
  <div className={cn('ml-2 h-[1.625rem] border border-turtle-level3', className)} />
)

export default VerticalDivider
