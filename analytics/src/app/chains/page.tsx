'use client'

import { useQuery } from '@tanstack/react-query'
import React, { useState, useRef, useEffect } from 'react'
import { getChainSankeyData, getChainsData } from '@/app/actions/chains'
import ChainsActivityTable from '@/components/ChainsActivityTable'
import ChainSankeyGraph from '@/components/ChainSankeyGraph'
import ErrorPanel from '@/components/ErrorPanel'
import TitleToggle from '@/components/TitleToggle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraphType } from '@/constants'
import useShowLoadingBar from '@/hooks/useShowLoadingBar'

type ChainSankeyDataItem = {
  from: string
  to: string
  size: number
}

type ChainSankeyData = {
  selectedChain: string
  byTransactionCount: ChainSankeyDataItem[]
  byVolume: ChainSankeyDataItem[]
}

export default function ChainsPage() {
  const [chainUid, setChainUid] = useState<string>('polkadot')
  const [graphType, setGraphType] = useState<GraphType>('volume')
  const [isSankeyDataInitialLoading, setSankeyDataInitialLoading] = useState(true)
  const previousSankeyDataRef = useRef<ChainSankeyData>(null)

  const {
    data: chainData,
    isLoading: loadingChainData,
    error: errorChainData,
  } = useQuery({
    queryKey: ['chainData'],
    queryFn: getChainsData,
  })

  const {
    data: chainSankeyData,
    isLoading: loadingSankeyData,
    error: errorSankeyData,
  } = useQuery({
    queryKey: ['sankeyDataChains', chainUid],
    queryFn: () => getChainSankeyData(chainUid),
  })

  useShowLoadingBar(loadingSankeyData)

  // Store sankey data in a ref when it's available
  useEffect(() => {
    if (chainSankeyData) {
      previousSankeyDataRef.current = chainSankeyData
      // Once we have chainSankeyData for the first time, we're no longer in the initial loading state
      if (isSankeyDataInitialLoading) {
        setSankeyDataInitialLoading(false)
      }
    }
  }, [chainSankeyData, isSankeyDataInitialLoading])

  // Use current data if available, otherwise use previous data to maintain graph continuity during loading states
  const currentSankeyData = chainSankeyData || previousSankeyDataRef.current
  const chainCurrentSankeyData =
    graphType === 'volume' ? currentSankeyData?.byVolume : currentSankeyData?.byTransactionCount

  const error = errorChainData || errorSankeyData
  const loading = loadingChainData || loadingSankeyData
  if (error && !loading) {
    return <ErrorPanel error={error} />
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>
            Data flow by
            <TitleToggle
              options={[
                { value: 'volume', label: 'Volume' },
                { value: 'transactions', label: 'Count' },
              ]}
              value={graphType}
              onChange={value => setGraphType(value as GraphType)}
              className="ml-3"
            />
          </CardTitle>
          <CardDescription>Select a source chain from the graph</CardDescription>
        </CardHeader>
        <CardContent>
          {isSankeyDataInitialLoading ? (
            <div className="flex h-[361px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          ) : (
            <ChainSankeyGraph
              data={chainCurrentSankeyData}
              type={graphType}
              selectedChain={chainUid}
              setChainUid={chainUid => setChainUid(chainUid)}
            />
          )}
        </CardContent>
      </Card>
      <div className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Activity overview</CardTitle>
            <CardDescription>Ranked by volume and transaction count</CardDescription>
          </CardHeader>
          <CardContent>
            <ChainsActivityTable chains={chainData?.chains || []} isLoading={loadingChainData} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
