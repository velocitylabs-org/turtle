'use client'
import { useQuery } from '@tanstack/react-query'
import { CircleCheckBig, DollarSign, Repeat, Activity } from 'lucide-react'
import { getSummaryData } from '@/app/actions/summary'
import ErrorPanel from '@/components/ErrorPanel'
import RecentTransactionsTable from '@/components/RecentTransactionsTable'
import SmallStatBox from '@/components/SmallStatBox'
import TopTokensChart from '@/components/TopTokensChart'
import TransactionVolumeChart from '@/components/TransactionVolumeChart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import useShowLoadingBar from '@/hooks/useShowLoadingBar'
import formatUSD from '@/utils/format-USD'

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['summary'],
    queryFn: getSummaryData,
  })

  useShowLoadingBar(isLoading)
  if (error && !isLoading) {
    return <ErrorPanel error={error} />
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
            <CardTitle>Transaction Volume</CardTitle>
            <CardDescription>Over the last 6 months (USD)</CardDescription>
          </CardHeader>
          <CardContent className="px-4">
            {isLoading ? (
              <div className="flex h-[300px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              </div>
            ) : (
              <TransactionVolumeChart data={data?.dailyVolume || []} />
            )}
          </CardContent>
        </Card>
        <Card className="col-span-full lg:col-span-3">
          <CardHeader>
            <CardTitle>Top Tokens</CardTitle>
            <CardDescription>With highest successful transaction volume (USD)</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-[300px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              </div>
            ) : (
              <TopTokensChart
                data={data?.topTokens || []}
                totalVolume={data?.totalVolumeUsd || 0}
              />
            )}
          </CardContent>
        </Card>
      </div>
      <div className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Last 5 transactions</CardDescription>
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
