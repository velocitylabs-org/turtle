'use client'

import { useQuery } from '@tanstack/react-query'
import { CircleCheckBig, DollarSign, Percent, Repeat } from 'lucide-react'
import React from 'react'
import { getSwapsData } from '@/app/actions/swaps'
import ErrorPanel from '@/components/ErrorPanel'
import RecentSwapsTable from '@/components/RecentSwapsTable'
import SmallStatBox from '@/components/SmallStatBox'
import SwapsActivityTable from '@/components/SwapsActivityTable'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { defaultTransactionLimit } from '@/constants'
import useShowLoadingBar from '@/hooks/useShowLoadingBar'
import formatUSD from '@/utils/format-USD'

export default function SwapsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['swaps'],
    queryFn: getSwapsData,
  })

  useShowLoadingBar(isLoading)
  if (error && !isLoading) {
    return <ErrorPanel error={error} />
  }

  const swapsSummaryData = data || {
    swapsTotalVolume: 0,
    successfulSwaps: 0,
    swapsSuccessRate: 0,
    swapsPercentageOfTransactions: 0,
    recentSwaps: 0,
  }

  console.log('swapsActivity', data?.swapsActivity)

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SmallStatBox
          title="Total Volume (USD)"
          value={`$${formatUSD(swapsSummaryData.swapsTotalVolume)}`}
          icon={DollarSign}
          iconColor="#2e4afb"
          isLoading={isLoading}
          skeletonWidth="w-32"
          description="Successful swaps only"
        />
        <SmallStatBox
          title="Total Swaps"
          value={swapsSummaryData.successfulSwaps}
          icon={Repeat}
          iconColor="#D2B48C"
          isLoading={isLoading}
          skeletonWidth="w-24"
        />
        <SmallStatBox
          title="Success Rate"
          value={`${Number.isInteger(swapsSummaryData.swapsSuccessRate) ? swapsSummaryData.swapsSuccessRate : swapsSummaryData.swapsSuccessRate.toFixed(1)}%`}
          icon={CircleCheckBig}
          iconColor="#22c55e"
          isLoading={isLoading}
          skeletonWidth="w-16"
        />
        <SmallStatBox
          title="Swap Rate"
          value={`${Number.isInteger(swapsSummaryData.swapsPercentageOfTransactions) ? swapsSummaryData.swapsPercentageOfTransactions : swapsSummaryData.swapsPercentageOfTransactions.toFixed(1)}%`}
          icon={Percent}
          isLoading={isLoading}
          iconColor="#a26eec"
          skeletonWidth="w-28"
          description="By transaction count"
        />
      </div>
      <div className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Swaps overview</CardTitle>
            <CardDescription>Ranked by volume and transaction count</CardDescription>
          </CardHeader>
          <CardContent>
            <SwapsActivityTable tokens={data?.swapsActivity || []} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>
      <div className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent swaps</CardTitle>
            <CardDescription>Last {defaultTransactionLimit} swaps</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentSwapsTable swaps={data?.recentSwaps || []} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
