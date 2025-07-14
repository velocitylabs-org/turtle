import { cn } from '@velocitylabs-org/turtle-ui'
import { FC } from 'react'

const VerticalDivider: FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('ml-2 h-[1.625rem] rounded-lg border border-turtle-level2', className)} />
  )
}

export default VerticalDivider
