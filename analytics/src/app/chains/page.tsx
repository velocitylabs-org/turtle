'use client'

import { useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'
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
  const { data, isLoading, error } = useQuery({
    queryKey: ['chains', chainUid],
    queryFn: () => getChainsData(chainUid),
  })

  useShowLoadingBar(isLoading)
  if (error && !isLoading) {
    return <ErrorPanel error={error} />
  }

  const chainData = graphType === 'volume' ? data?.byVolume : data?.byTransactionCount
  console.log('chainData', chainData)

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
          <CardDescription>
            Select a source chain from the graph
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-[500px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          ) : (
            <ChainPathsGraph data={chainData} type={graphType} loading={isLoading} selectedChain={chainUid} setChainUid={(chainUid) => setChainUid(chainUid)}/>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
