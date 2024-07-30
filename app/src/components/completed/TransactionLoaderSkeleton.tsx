import { ArrowRight } from '../svg/ArrowRight'
import { Skeleton } from '../ui/skeleton'

import { colors } from '../../../tailwind.config'

const TransactionCard = () => {
  return (
    <div className="flex items-center rounded-2xl border border-turtle-level3 p-4 sm:gap-4">
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between space-x-2 overflow-x-auto">
          <div className="flex items-center space-x-1 text-xl font-medium leading-none">
            <Skeleton className="h-5 w-6 rounded-lg" />
            <Skeleton className="h-5 w-14" />
            <div className="items-centern flex space-x-2 rounded-2xl border px-1 py-0.5">
              <Skeleton className="h-4 w-4 rounded-full" />
              <ArrowRight
                className="w-[0.45rem h-[0.45rem]"
                {...{ fill: colors['turtle-level2'] }}
              />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-5 w-10" />
        </div>

        <div className="flex items-center justify-start space-x-4">
          <div className="flex items-center gap-x-1">
            <Skeleton className="h-4 w-4 rounded-full border-turtle-level3" />
            <Skeleton className="h-5 w-20" />
          </div>
          <ArrowRight className="h-3 w-3" {...{ fill: colors['turtle-level2'] }} />
          <div className="flex items-center gap-x-2">
            <Skeleton className="h-4 w-4 rounded-full border-turtle-level3" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      </div>
    </div>
  )
}

const TransactionLoaderSkeleton = () => {
  return (
    <div className="z-20 mb-12 flex max-w-[90vw] flex-col gap-4 rounded-3xl bg-white p-4 px-[1.5rem] py-[2rem] sm:w-[31.5rem] sm:p-[2.5rem]">
      {Array.from({ length: 2 }, (_, i) => i + 1).map(idx => (
        <div key={idx} className="z-30">
          <div className="w-full space-y-4">
            <Skeleton className="h-5 w-1/3" />
            {Array.from({ length: 2 }, (_, i) => i + 1).map(idx => (
              <TransactionCard key={idx} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default TransactionLoaderSkeleton
