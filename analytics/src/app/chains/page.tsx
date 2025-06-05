'use client'

import { useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'
import { getChainsData } from '@/app/actions/chains'
import ErrorPanel from '@/components/ErrorPanel'
import MultiSelect from '@/components/MultiSelect'
import TitleToggle from '@/components/TitleToggle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { chains, GraphType } from '@/constants'
import useShowLoadingBar from '@/hooks/useShowLoadingBar'
import { getSrcFromLogo } from '@/utils/get-src-from-logo'

export default function ChainsPage() {
  const [chainUid, setChainUid] = useState<string>("ethereum")
  const [graphType, setGraphType] = useState<GraphType>('volume')
  const { data, isLoading, error } = useQuery({
    queryKey: ['chains', chainUid],
    queryFn: () => getChainsData(chainUid),
  })

  const chainOptions = chains.map(chain => ({
    value: chain.uid,
    label: chain.name,
    logoURI: getSrcFromLogo(chain),
  }))

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
            <div className="flex items-center gap-4">
              <div>Select chain</div>
              <div className="w-[150px]">
                <MultiSelect
                  options={chainOptions}
                  selected={[chainUid]}
                  onChange={(val) => {
                    if (Array.isArray(val) && val.length > 0) {
                      setChainUid(val[0])
                    }
                  }}
                  placeholder="Source chain"
                  singleSelect
                  preventEmpty
                  showBadges={false}
                />
              </div>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
         <div>some content here</div>
        </CardContent>
      </Card>
    </div>
  )
}
