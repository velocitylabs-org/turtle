'use client'

import NumberFlow from '@number-flow/react'
import {useQuery} from '@tanstack/react-query'
import getAnalyticsData from '@/actions/analytics'
import {QueryProvider} from '@/providers/queryProvider'

const format = {
  style: 'currency',
  currency: 'USD',
  trailingZeroDisplay: 'stripIfInteger',
  maximumFractionDigits: 1,
} as const

interface AnalyticDataProps {
  initialVolume: number | undefined
}

export default function AnalyticData({initialVolume}: AnalyticDataProps) {
  // Using client-side rendering here while keeping the rest of the app server-side for SEO performance
  return (
    <QueryProvider>
      <AnalyticDataClient initialVolume={initialVolume}/>
    </QueryProvider>
  )
}

function AnalyticDataClient({initialVolume}: AnalyticDataProps) {
  const {data: realTimeData} = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      return await getAnalyticsData()
    },
  })

  // Fallback to initialVolume when realTimeData is loading or unavailable to avoid empty state on first render
  const value = realTimeData?.totalVolumeUsd || initialVolume || 0

  return (
    <div
      className="relative z-50 my-[8vw] flex h-auto w-full flex-col items-center justify-center md:my-[6vw] lg:my-[4vw]">
      <div
        className="flex items-center gap-2 rounded-full border border-black bg-turtle-primary px-4 py-2 md:px-5 md:py-3">
        <BoltIcon/>
        <span className="text-[16px] text-black md:text-[18px] lg:text-[20px]">
          <span className="mr-1 inline-flex w-[100px] items-center justify-center font-bold md:w-[110px] lg:w-[125px]">
            <NumberFlow value={value} format={format}/>
          </span>{' '}
          Total funds moved in Turtle
        </span>
      </div>
    </div>
  )
}

function BoltIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4.88899 12.5155L16.8 1L13.6 10.625H18.7635C19.213 10.625 19.4342 11.172 19.111 11.4845L7.2 23L10.4 13.375H5.23652C4.78699 13.375 4.5658 12.828 4.88899 12.5155Z"
        stroke="#001B04"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  )
}
