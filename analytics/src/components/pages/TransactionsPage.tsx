'use client'
import { useQuery } from '@tanstack/react-query'
import { Token } from '@velocitylabs-org/turtle-registry'
import { tokensById, chainsByUid } from '@velocitylabs-org/turtle-registry'
import { getOriginBadge } from '@velocitylabs-org/turtle-ui'
import { CheckCircle, X, DollarSign, Ban, CircleHelp } from 'lucide-react'
import React, { useState } from 'react'
import { getTransactionsData } from '@/app/actions/transactions'
import DatePicker from '@/components/DatePicker'
import ErrorPanel from '@/components/ErrorPanel'
import MultiSelect from '@/components/MultiSelect'
import RecentTransactionsTable from '@/components/RecentTransactionsTable'
import SmallStatBox from '@/components/SmallStatBox'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { chains, tokens } from '@/constants'
import useShowLoadingBar from '@/hooks/useShowLoadingBar'
import { txStatus } from '@/models/Transaction'
import formatUSD from '@/utils/format-USD'
import { getSrcFromLogo } from '@/utils/get-src-from-logo'

export default function TransactionsPage() {
  const [sourceChainUid, setSourceChainUid] = useState<string[]>([])
  const [destinationChainUid, setDestinationChainUid] = useState<string[]>([])
  const [sourceTokenId, setSourceTokenId] = useState<string[]>([])
  const [destinationTokenId, setDestinationTokenId] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<null | txStatus>(null)
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined)
  const [toDate, setToDate] = useState<Date | undefined>(undefined)

  const chainOptions = chains.map(chain => ({
    value: chain.uid,
    label: chain.name,
    logoURI: getSrcFromLogo(chain),
  }))

  const tokenSourceOptions = tokens
    .map((token: Token) => {
      const { logoURI, originLogoURI } = getLogoAndOriginURI(token.id, sourceChainUid[0])
      return {
        value: token.id,
        label: token.symbol,
        logoURI,
        originLogoURI,
      }
    })
    .filter(token => !!token.originLogoURI)

  const tokenDestinationOptions = tokens
    .map((token: Token) => {
      const { logoURI, originLogoURI } = getLogoAndOriginURI(token.id, destinationChainUid[0])
      return {
        value: token.id,
        label: token.symbol,
        logoURI,
        originLogoURI,
      }
    })
    .filter(token => !!token.originLogoURI)

  const { data, isLoading, error } = useQuery({
    queryKey: [
      'transactions',
      sourceChainUid,
      destinationChainUid,
      sourceTokenId,
      destinationTokenId,
      statusFilter,
      fromDate,
      toDate,
    ],
    queryFn: () => getTransactionsData({
      sourceChainUid: sourceChainUid.length > 0 ? sourceChainUid : undefined,
      destinationChainUid: destinationChainUid.length > 0 ? destinationChainUid : undefined,
      sourceTokenId: sourceTokenId.length > 0 ? sourceTokenId : undefined,
      destinationTokenId: destinationTokenId.length > 0 ? destinationTokenId : undefined,
      status: statusFilter,
      startDate: fromDate,
      endDate: toDate,
    })
  })
  useShowLoadingBar(isLoading)
  const transactions = data?.transactions || []
  const summaryData = data?.summary || {
    totalVolumeUsd: 0,
    totalTransactions: 0,
    succeededCount: 0,
    failedCount: 0,
    undefinedCount: 0,
  }

  const resetFilters = () => {
    setStatusFilter(null)
    setSourceChainUid([])
    setDestinationChainUid([])
    setSourceTokenId([])
    setDestinationTokenId([])
    setFromDate(undefined)
    setToDate(undefined)
  }

  if (error && !isLoading) {
    return <ErrorPanel error={error} />
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
          description="Counting all transactions"
        />
        <SmallStatBox
          title="Succeeded transactions"
          value={summaryData.succeededCount}
          icon={CheckCircle}
          iconColor="#22c55e"
          isLoading={isLoading}
          skeletonWidth="w-20"
        />
        <SmallStatBox
          title="Failed transactions"
          value={summaryData.failedCount}
          icon={Ban}
          iconColor="#ef4444"
          isLoading={isLoading}
          skeletonWidth="w-20"
        />
        <SmallStatBox
          title="Undefined transactions"
          value={summaryData.undefinedCount}
          icon={CircleHelp}
          iconColor="#eab308"
          isLoading={isLoading}
          skeletonWidth="w-20"
        />
      </div>
      <div className="mt-4 space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              {/* Date pickers section */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <div className="flex flex-shrink-0 items-center p-2">
                    <button
                      className="rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onClick={resetFilters}
                    >
                      <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      <span className="sr-only">Clear filters</span>
                    </button>
                  </div>
                  <div className="flex flex-1 gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`flex-1 ${statusFilter === 'succeeded' ? 'bg-green-100' : ''}`}
                      onClick={() =>
                        setStatusFilter(statusFilter === 'succeeded' ? null : 'succeeded')
                      }
                    >
                      <CheckCircle className="mr-1 h-4 w-4" />
                      <span className="hidden lg:inline">Succeeded</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`flex-1 ${statusFilter === 'failed' ? 'bg-red-100' : ''}`}
                      onClick={() => setStatusFilter(statusFilter === 'failed' ? null : 'failed')}
                    >
                      <Ban className="mr-1 h-4 w-4" />
                      <span className="hidden lg:inline">Failed</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`flex-1 ${statusFilter === 'undefined' ? 'bg-yellow-100' : ''}`}
                      onClick={() =>
                        setStatusFilter(statusFilter === 'undefined' ? null : 'undefined')
                      }
                    >
                      <CircleHelp className="mr-1 h-4 w-4" />
                      <span className="hidden lg:inline">Undefined</span>
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-1">
                    <DatePicker date={fromDate} setDate={setFromDate} placeholder="From date" />
                  </div>
                  <div className="col-span-1">
                    <DatePicker date={toDate} setDate={setToDate} placeholder="To date" />
                  </div>
                </div>
              </div>
              {/* Chain and token selectors */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <MultiSelect
                    options={chainOptions}
                    selected={sourceChainUid}
                    onChange={setSourceChainUid}
                    placeholder="Source Chain"
                    singleSelect
                  />
                </div>
                <div>
                  <MultiSelect
                    options={tokenSourceOptions}
                    selected={sourceTokenId}
                    onChange={setSourceTokenId}
                    placeholder="Source Token"
                    disabled={sourceChainUid.length === 0}
                    singleSelect
                  />
                </div>
                <div>
                  <MultiSelect
                    options={chainOptions}
                    selected={destinationChainUid}
                    onChange={setDestinationChainUid}
                    placeholder="Destination Chain"
                    singleSelect
                  />
                </div>
                <div>
                  <MultiSelect
                    options={tokenDestinationOptions}
                    selected={destinationTokenId}
                    onChange={setDestinationTokenId}
                    placeholder="Destination Token"
                    singleSelect
                    disabled={destinationChainUid.length === 0}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Last 5 transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentTransactionsTable transactions={transactions} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function getLogoAndOriginURI(tokenId: string, chainUid: string) {
  const token = tokensById[tokenId]
  const chain = chainsByUid[chainUid]
  const tokenURI = getSrcFromLogo(token)
  const originBadge = getOriginBadge(token, chain)
  const originBadgeURI = originBadge && getSrcFromLogo(originBadge)

  return {
    logoURI: tokenURI,
    originLogoURI: originBadgeURI,
  }
}
