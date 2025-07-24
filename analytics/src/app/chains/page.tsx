'use client'

import { useQuery } from '@tanstack/react-query'
import { parseAsStringLiteral, useQueryState } from 'nuqs'
import { useEffect, useState } from 'react'
import { getChainSankeyData, getChainsData } from '@/app/actions/chains'
import ChainSankeyGraph from '@/components/ChainSankeyGraph'
import ChainsActivityTable from '@/components/ChainsActivityTable'
import ErrorPanel from '@/components/ErrorPanel'
import TitleToggle from '@/components/TitleToggle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { type GraphType, relayChain } from '@/constants'
import useShowLoadingBar from '@/hooks/useShowLoadingBar'

const graphTypeQueryDefault = parseAsStringLiteral(['volume', 'count'] as const).withDefault('volume')

export default function ChainsPage() {
  const [chainUid, setChainUid] = useQueryState('chainUid', { defaultValue: relayChain.uid })
  const [graphType, setGraphType] = useQueryState('graphType', graphTypeQueryDefault)
  const [isSankeyDataInitialLoading, setSankeyDataInitialLoading] = useState(true)

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

  useEffect(() => {
    if (chainSankeyData) {
      // Once we have chainSankeyData for the first time, we're no longer in the initial loading state
      if (isSankeyDataInitialLoading) {
        setSankeyDataInitialLoading(false)
      }
    }
  }, [chainSankeyData, isSankeyDataInitialLoading])

  const chainCurrentSankeyData =
    graphType === 'volume' ? chainSankeyData?.byVolume : chainSankeyData?.byTransactionCount

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
                { value: 'count', label: 'Count' },
              ]}
              value={graphType}
              onChange={(value) => setGraphType(value as GraphType)}
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
              setChainUid={(chainUid) => setChainUid(chainUid)}
              loading={loadingSankeyData}
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
