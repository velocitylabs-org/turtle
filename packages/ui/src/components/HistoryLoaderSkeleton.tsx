import { colors } from '@velocitylabs-org/turtle-tailwind-config'
import { ArrowRight } from 'lucide-react'
import { cn } from '../helpers'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-turtle-level2', className)} {...props} />
}

function SkeletonAddresses() {
  return (
    <div className="flex items-center justify-start space-x-4">
      {/* Transaction skeleton sender */}
      <div className="flex items-center gap-x-1">
        <Skeleton className="h-4 w-4 rounded-full border-turtle-level3" />
        <Skeleton className="h-5 w-20" />
      </div>
      <ArrowRight className="h-3 w-3" fill={colors['turtle-level2']} />
      {/* Transaction skeleton recipient */}
      <div className="flex items-center gap-x-2">
        <Skeleton className="h-4 w-4 rounded-full border-turtle-level3" />
        <Skeleton className="h-5 w-20" />
      </div>
    </div>
  )
}

function SkeletonTokens() {
  return (
    <div className="items-centern flex space-x-2 rounded-2xl border px-1 py-0.5">
      <Skeleton className="h-4 w-4 rounded-full" />
      <ArrowRight className="w-[0.45rem h-[0.45rem]" fill={colors['turtle-level2']} />
      <Skeleton className="h-4 w-4 rounded-full" />
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="flex items-center rounded-2xl border border-turtle-level3 p-4 sm:gap-4">
      <div className="w-full space-y-2">
        {/* Transaction skeleton header */}
        <div className="flex items-center justify-between space-x-2 overflow-x-auto">
          <div className="flex items-center space-x-1 text-xl leading-none">
            {/* Transaction skeleton status */}
            <Skeleton className="h-5 w-6 rounded-lg" />
            {/* Transaction skeleton amount */}
            <Skeleton className="h-5 w-14" />
            {/* Transaction skeleton from/to tokens direction */}
            <SkeletonTokens />
          </div>
          {/* Transaction skeleton date */}
          <Skeleton className="h-5 w-10" />
        </div>
        {/* Transaction skeleton from/to addresses direction */}
        <SkeletonAddresses />
      </div>
    </div>
  )
}

export const HistoryLoaderSkeleton = ({ length }: { length: number }) => {
  return (
    <div className="border border-t-0 border-turtle-foreground h-[90vh] sm:h-[525px] overflow-y-auto flex flex-col gap-4 rounded-b-3xl bg-white p-4 px-[1.5rem] py-[2rem] sm:w-[31.5rem] sm:p-[2.5rem]">
      {Array.from({ length }, (_, i) => i + 1).map(idx => (
        <div key={idx} className="w-full space-y-4">
          <Skeleton className="h-5 w-1/3" />
          {Array.from({ length: 2 }, (_, i) => i + 1).map(idx => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ))}
    </div>
  )
}
