'use client'
import { useQuery } from '@tanstack/react-query'
import { CircleCheckBig, DollarSign, Repeat, Activity } from 'lucide-react'
import { useState } from 'react'
import { getSummaryData } from '@/app/actions/summary'
import ErrorPanel from '@/components/ErrorPanel'
import StandardMultiSelect from '@/components/MultiSelect'
import RecentTransactionsTable from '@/components/RecentTransactionsTable'
import SmallStatBox from '@/components/SmallStatBox'
import TitleToggle from '@/components/TitleToggle'
import TopTokensChart from '@/components/TopTokensChart'
import TransactionChart from '@/components/TransactionChart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { defaultTransactionLimit, GraphType, TimePeriodType } from '@/constants'
import useShowLoadingBar from '@/hooks/useShowLoadingBar'
import formatUSD from '@/utils/format-USD'

const periodConfig = {
  'last-6-months': {
    dataKey: 'sixMonthsData',
    timeRange: 'last-6-months',
    label: 'Six months',
  },
  'last-month': {
    dataKey: 'lastMonthData',
    timeRange: 'last-month',
    label: 'Last month',
  },
  'this-week': {
    dataKey: 'thisWeekData',
    timeRange: 'this-week',
    label: 'This week',
  },
} as const

export default function HomeDashboardPage() {
  const [transactionGraphType, setTransactionGraphType] = useState<GraphType>('volume')
  const [tokensGraphType, setTokensGraphType] = useState<GraphType>('volume')
  const [timePeriod, setTimePeriod] = useState<TimePeriodType>('last-6-months')
  const { data, isLoading, error } = useQuery({
    queryKey: ['summary'],
    queryFn: getSummaryData,
  })

  useShowLoadingBar(isLoading)
  if (error && !isLoading) {
    return <ErrorPanel error={error} />
  }

  const getTransactionData = () => {
    const dataKey = periodConfig[timePeriod].dataKey
    return data?.transactionData?.[dataKey] || []
  }

  const summaryData = data || {
    totalVolumeUsd: 0,
    totalTransactions: 0,
    avgTransactionValue: 0,
    successRate: 0,
  }

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SmallStatBox
          title="Total Volume (USD)"
          value={`$${formatUSD(summaryData.totalVolumeUsd)}`}
          icon={DollarSign}
          iconColor="#2e4afb"
          isLoading={isLoading}
          skeletonWidth="w-32"
          description="Successful transactions only"
        />
        <SmallStatBox
          title="Total Transactions"
          value={summaryData.totalTransactions}
          icon={Repeat}
          iconColor="#D2B48C"
          isLoading={isLoading}
          skeletonWidth="w-24"
        />
        <SmallStatBox
          title="Success Rate"
          value={`${Number.isInteger(summaryData.successRate) ? summaryData.successRate : summaryData.successRate.toFixed(1)}%`}
          icon={CircleCheckBig}
          iconColor="#22c55e"
          isLoading={isLoading}
          skeletonWidth="w-16"
        />
        <SmallStatBox
          title="Avg. Transaction Value (USD)"
          value={`$${formatUSD(summaryData.avgTransactionValue)}`}
          icon={Activity}
          isLoading={isLoading}
          iconColor="#a26eec"
          skeletonWidth="w-28"
          description="Successful transactions only"
        />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-7">
        <Card className="col-span-full lg:col-span-4">
          <CardHeader>
            <CardTitle>
              Transactions by
              <TitleToggle
                options={[
                  { value: 'volume', label: 'Volume' },
                  { value: 'transactions', label: 'Count' },
                ]}
                value={transactionGraphType}
                onChange={value => setTransactionGraphType(value as GraphType)}
                className="ml-3"
              />
            </CardTitle>
            <CardDescription>
              <div className="relative -top-[7px] flex items-center gap-1">
                Select timeframe
                <StandardMultiSelect
                  options={Object.entries(periodConfig).map(([value, config]) => ({
                    value,
                    label: config.label,
                  }))}
                  selected={[timePeriod]}
                  onChange={values => {
                    if (Array.isArray(values)) {
                      setTimePeriod(values[0] as TimePeriodType)
                    }
                  }}
                  showBadges={false}
                  singleSelect
                  minimal
                  preventEmpty
                  className="w-[100px]"
                />
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4">
            {isLoading ? (
              <div className="flex h-[300px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              </div>
            ) : (
              <TransactionChart
                data={getTransactionData()}
                type={transactionGraphType}
                timeRange={periodConfig[timePeriod].timeRange}
              />
            )}
          </CardContent>
        </Card>
        <Card className="col-span-full lg:col-span-3">
          <CardHeader>
            <CardTitle>
              Top tokens by
              <TitleToggle
                options={[
                  { value: 'volume', label: 'Volume' },
                  { value: 'transactions', label: 'Count' },
                ]}
                value={tokensGraphType}
                onChange={value => setTokensGraphType(value as GraphType)}
                className="ml-3"
              />
            </CardTitle>
            <CardDescription>With highest successful transaction</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-[300px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              </div>
            ) : (
              <TopTokensChart
                data={
                  tokensGraphType === 'volume' ? data?.topTokensByVolume : data?.topTokensByCount
                }
                total={
                  tokensGraphType === 'volume' ? data?.totalVolumeUsd : data?.totalTransactions
                }
                type={tokensGraphType}
              />
            )}
          </CardContent>
        </Card>
      </div>
      <div className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Last {defaultTransactionLimit} transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentTransactionsTable
              transactions={data?.recentTransactions || []}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
