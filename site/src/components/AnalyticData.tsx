'use client'

import NumberFlow from '@number-flow/react'
import { useQuery } from '@tanstack/react-query'
import getAnalyticsData from '@/actions/analytics'
import { QueryProvider } from '@/providers/queryProvider'

const format = {
  style: 'decimal',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
  trailingZeroDisplay: 'stripIfInteger',
} as const

interface AnalyticDataProps {
  initialVolume: number | undefined
}

export default function AnalyticData({ initialVolume }: AnalyticDataProps) {
  // Using client-side rendering here while keeping the rest of the app server-side for SEO performance
  return (
    <QueryProvider>
      <AnalyticDataClient initialVolume={initialVolume} />
    </QueryProvider>
  )
}

function AnalyticDataClient({ initialVolume }: AnalyticDataProps) {
  const { data: realTimeData } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      return await getAnalyticsData()
    },
  })

  // Fallback to initialVolume when realTimeData is loading or unavailable to avoid empty state on first render
  const value = realTimeData?.totalVolumeUsd || initialVolume || 0

  return (
    <div className="relative z-50 my-[8vw] flex h-auto w-full flex-col items-center justify-center md:my-[6vw] lg:my-[4vw]">
      <div className="flex items-center gap-2 rounded-[40px] border border-black bg-turtle-primary px-6 py-3">
        <div className="flex-col items-center justify-center text-[16px] text-black md:text-[18px] lg:text-[20px]">
          <div className="text-center text-[28px] font-bold sm:text-[32px]">
            <NumberFlow value={value} format={format} prefix="$" />
          </div>
          <div className="relative top-[-5px] text-[18px] leading-tight sm:text-[20px]">
            Funds moved through Turtle
          </div>
        </div>
      </div>
    </div>
  )
}
