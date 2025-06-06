'use client'

import { useQuery } from '@tanstack/react-query'
import React, { useState, useRef, useEffect } from 'react'
import { getChainsData } from '@/app/actions/chains'
import ChainPathsGraph from '@/components/ChainSankeyGraph'
import ErrorPanel from '@/components/ErrorPanel'
import TitleToggle from '@/components/TitleToggle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraphType } from '@/constants'
import useShowLoadingBar from '@/hooks/useShowLoadingBar'

export default function ChainsPage() {
  const [chainUid, setChainUid] = useState<string>('polkadot')
  const [graphType, setGraphType] = useState<GraphType>('volume')
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const previousDataRef = useRef<any>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['chains', chainUid],
    queryFn: () => getChainsData(chainUid),
  })

  useShowLoadingBar(isLoading)

  // Store data in a ref when it's available
  useEffect(() => {
    if (data) {
      previousDataRef.current = data
      // Once we have data for the first time, we're no longer in the initial loading state
      if (isInitialLoading) {
        setIsInitialLoading(false)
      }
    }
  }, [data, isInitialLoading])

  // Use current data if available, otherwise use previous data to maintain graph continuity during loading states
  const currentData = data || previousDataRef.current
  const chainData = graphType === 'volume' ? currentData?.byVolume : currentData?.byTransactionCount

  if (error && !isLoading) {
    return <ErrorPanel error={error} />
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>
            Activity by
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
          {isInitialLoading ? (
            <div className="flex h-[361px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          ) : (
            <ChainPathsGraph
              data={chainData}
              type={graphType}
              selectedChain={chainUid}
              setChainUid={chainUid => setChainUid(chainUid)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
