'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { cn } from '@velocitylabs-org/turtle-ui'
import { CircleCheckBig, DollarSign, Percent, Repeat } from 'lucide-react'
import { parseAsInteger, parseAsStringLiteral, useQueryState } from 'nuqs'
import React from 'react'
import { getSwapList, getSwapsData } from '@/app/actions/swaps'
import ErrorPanel from '@/components/ErrorPanel'
import RecentSwapsTable from '@/components/RecentSwapsTable'
import SmallStatBox from '@/components/SmallStatBox'
import SwapPairsGraph from '@/components/SwapPairsGraph'
import TitleToggle from '@/components/TitleToggle'
import TokensActivityTable from '@/components/TokensActivityTable'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { transactionsPerPage, GraphType } from '@/constants'
import { usePagination } from '@/hooks/usePagination'
import useShowLoadingBar from '@/hooks/useShowLoadingBar'
import formatUSD from '@/utils/format-USD'

const toggleOptions = [
  { value: 'volume', label: 'Volume' },
  { value: 'count', label: 'Count' },
]
const togglesQueryDefault = parseAsStringLiteral(['volume', 'count'] as const).withDefault('volume')
const pageQueryDefault = parseAsInteger.withDefault(1)

export default function SwapsPage() {
  const [currentPage, setCurrentPage] = useQueryState('swapPage', pageQueryDefault)
  const [topSwapsGraphType, setTopSwapsGraphType] = useQueryState('transactionsBy', togglesQueryDefault)
  const { data, isLoading, error } = useQuery({
    queryKey: ['swaps'],
    queryFn: getSwapsData,
  })

  const {
    data: dataList,
    isLoading: isInitialLoadingList,
    isFetching: isFetchingList,
    error: errorList,
  } = useQuery({
    queryKey: ['swapList', currentPage],
    queryFn: () => getSwapList(currentPage),
    placeholderData: keepPreviousData,
  })

  const swapsSummaryData = data || {
    swapsTotalVolume: 0,
    successfulSwaps: 0,
    swapsSuccessRate: 0,
    swapsPercentageOfTransactions: 0,
    swapPairsByVolume: [],
    swapPairsByTransactions: [],
    totalSwaps: 0,
  }

  const { PaginationComponent } = usePagination({
    totalItems: swapsSummaryData.totalSwaps,
    itemsPerPage: transactionsPerPage,
    currentPage,
    onPageChange: setCurrentPage,
  })

  const loading = isLoading || isFetchingList
  useShowLoadingBar(loading)
  const commonError = error || (errorList as Error)

  if (commonError && !loading) {
    return <ErrorPanel error={commonError} />
  }

  const topSwapsPairs =
    topSwapsGraphType === 'volume' ? data?.swapPairsByVolume || [] : data?.swapPairsByTransactions || []

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
          title="Succeeded swaps"
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
            <CardTitle>
              Top swap pairs by
              <TitleToggle
                options={toggleOptions}
                value={topSwapsGraphType}
                onChange={value => setTopSwapsGraphType(value as GraphType)}
                className="ml-3"
              />
            </CardTitle>
            <CardDescription>Successful swaps only</CardDescription>
          </CardHeader>
          <CardContent>
            <SwapPairsGraph
              data={topSwapsPairs}
              loading={isLoading}
              type={topSwapsGraphType}
              totalVolume={swapsSummaryData.swapsTotalVolume}
              totalSwaps={swapsSummaryData.successfulSwaps}
            />
          </CardContent>
        </Card>
      </div>
      <div className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Swaps overview</CardTitle>
            <CardDescription>By volume and transaction count (successful only)</CardDescription>
          </CardHeader>
          <CardContent>
            <TokensActivityTable tokens={data?.swapsActivity || []} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>
      <div className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Swap list</CardTitle>
            <CardDescription>Showing {transactionsPerPage} swaps per page</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentSwapsTable swaps={dataList?.swapList || []} isLoading={isInitialLoadingList} />
            {!isInitialLoadingList && (
              <PaginationComponent className={cn('mt-7', isFetchingList && 'pointer-events-none')} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
