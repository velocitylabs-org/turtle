import { cn } from '@/utils/helper'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-turtle-level2', className)} {...props} />
}

export { Skeleton }
