import { cn } from '@velocitylabs-org/turtle-ui'

interface VerticalDividerProps {
  className?: string
}

export default function VerticalDivider({ className }: VerticalDividerProps) {
  return (
    <div className={cn('ml-2 h-[1.625rem] rounded-lg border-1 border-turtle-level2', className)} />
  )
}
