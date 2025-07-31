'use client'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { cn, Checkbox } from '@velocitylabs-org/turtle-ui'
import { CircleCheckBig, DollarSign, Repeat, Activity } from 'lucide-react'
import { useQueryState, parseAsStringLiteral, parseAsBoolean, parseAsInteger } from 'nuqs'
import { getSummaryData } from '@/app/actions/summary'
import { getTxList } from '@/app/actions/tx-list'
import ErrorPanel from '@/components/ErrorPanel'
import RecentTransactionsTable from '@/components/RecentTransactionsTable'
import Select from '@/components/Select'
import SmallStatBox from '@/components/SmallStatBox'
import TitleToggle from '@/components/TitleToggle'
import TopTokensChart from '@/components/TopTokensChart'
import TransactionChart from '@/components/TransactionChart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { transactionsPerPage, GraphType, TimePeriodType } from '@/constants'
import { usePagination } from '@/hooks/usePagination'
import useShowLoadingBar from '@/hooks/useShowLoadingBar'
import formatUSD from '@/utils/format-USD'

const toggleOptions = [
  { value: 'volume', label: 'Volume' },
  { value: 'count', label: 'Count' },
]

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
  'last-week': {
    dataKey: 'lastWeekData',
    timeRange: 'last-week',
    label: 'Last week',
  },
} as const

const togglesQueryDefault = parseAsStringLiteral(['volume', 'count'] as const).withDefault('volume')
const timePeriodQueryDefault = parseAsStringLiteral(['last-6-months', 'last-month', 'last-week'] as const).withDefault(
  'last-6-months',
)
const booleanDefaultTrue = parseAsBoolean.withDefault(true)
const pageQueryDefault = parseAsInteger.withDefault(1)

export default function HomeDashboardPage() {
  const [transactionGraphType, setTransactionGraphType] = useQueryState('transactionsBy', togglesQueryDefault)
  const [tokensGraphType, setTokensGraphType] = useQueryState('topTokensBy', togglesQueryDefault)
  const [timePeriod, setTimePeriod] = useQueryState('transactionsPeriod', timePeriodQueryDefault)
  const [outliers, setOutliers] = useQueryState('outliers', booleanDefaultTrue)
  const [currentPage, setCurrentPage] = useQueryState('page', pageQueryDefault)

  const { data, isLoading, error } = useQuery({
    queryKey: ['summary'],
    queryFn: getSummaryData,
  })

  const {
    data: dataList,
    isLoading: isInitialLoadingList,
    isFetching: isFetchingList,
    error: errorList,
  } = useQuery({
    queryKey: ['transactionList', currentPage],
    queryFn: () => getTxList(currentPage),
    placeholderData: keepPreviousData,
  })

  const summaryData = data || {
    totalVolumeUsd: 0,
    totalTransactions: 0,
    avgTransactionValue: 0,
    successRate: 0,
    totalRecentTransactions: 0,
  }

  const { PaginationComponent } = usePagination({
    totalItems: summaryData.totalTransactions,
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

  const getTransactionData = () => {
    const dataTimeframeKey = periodConfig[timePeriod].dataKey
    const dataKey = outliers ? 'normal' : 'flattened'
    return data?.transactionData ? data.transactionData[dataKey]?.[dataTimeframeKey] || [] : []
  }

  const getTopTokensData = () => {
    const tokensType = tokensGraphType === 'volume' ? 'topTokensByVolume' : 'topTokensByCount'
    return data?.topTokensData ? data.topTokensData[tokensType] || [] : []
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
      <div className="mt-4 grid gap-4 lg:grid-cols-10">
        <Card className="col-span-full lg:col-span-6">
          <CardHeader>
            <CardTitle className="flex w-full items-center justify-between">
              <div className="flex items-center">
                Transactions by
                <TitleToggle
                  options={toggleOptions}
                  value={transactionGraphType}
                  onChange={value => setTransactionGraphType(value as GraphType)}
                  className="ml-3"
                />
              </div>
              <CheckboxLabel
                id="outliers"
                label="Outliers"
                checked={outliers}
                onCheckedChange={setOutliers}
                className="ml-0"
                tooltip="Filter out high-value transactions > $50k"
              />
            </CardTitle>
            <CardDescription>
              <div className="relative -top-[10px] flex items-center gap-2">
                Timeframe
                <Select
                  options={Object.entries(periodConfig).map(([value, config]) => ({
                    value,
                    label: config.label,
                  }))}
                  selected={timePeriod}
                  onChange={val => setTimePeriod(val as TimePeriodType)}
                  showBadge={false}
                  minimal
                  className="w-[100px] !text-black"
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
        <Card className="col-span-full lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex w-full items-center justify-between">
              <div className="flex items-center">
                Top tokens by
                <TitleToggle
                  options={toggleOptions}
                  value={tokensGraphType}
                  onChange={value => setTokensGraphType(value as GraphType)}
                  className="ml-3"
                />
              </div>
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
                data={getTopTokensData()}
                total={tokensGraphType === 'volume' ? data?.totalVolumeUsd : data?.totalTransactions}
                type={tokensGraphType}
              />
            )}
          </CardContent>
        </Card>
      </div>
      <div className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Transaction list</CardTitle>
            <CardDescription>Showing {transactionsPerPage} transactions per page</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentTransactionsTable transactions={dataList?.txList || []} isLoading={isInitialLoadingList} />
            {!isInitialLoadingList && (
              <PaginationComponent className={cn('mt-7', isFetchingList && 'pointer-events-none')} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface CheckboxLabelProps {
  id: string
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  className?: string
  tooltip?: string
}

function CheckboxLabel({ id, label, checked, onCheckedChange, className, tooltip }: CheckboxLabelProps) {
  return (
    <div className={cn('ml-4 flex items-center space-x-2', className)} title={tooltip}>
      <Checkbox id={id} checked={checked} onCheckedChange={checked => onCheckedChange(checked === true)} />
      <label
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
      </label>
    </div>
  )
}
