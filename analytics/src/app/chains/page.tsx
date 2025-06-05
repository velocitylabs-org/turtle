'use client'

import { useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'
import { getChainsData } from '@/app/actions/chains'
import ErrorPanel from '@/components/ErrorPanel'
import MultiSelect from '@/components/MultiSelect'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { chains } from '@/constants'
import useShowLoadingBar from '@/hooks/useShowLoadingBar'
import { getSrcFromLogo } from '@/utils/get-src-from-logo'

export default function ChainsPage() {
  const [chainUid, setChainUid] = useState<string>("ethereum")
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

  console.log('data', data)

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-4">
              <div>
                Activity asset flow
              </div>
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
          </CardTitle>
          <CardDescription>By volume and transaction count</CardDescription>
        </CardHeader>
        <CardContent>
         <div>some content here</div>
        </CardContent>
      </Card>
    </div>
  )
}
