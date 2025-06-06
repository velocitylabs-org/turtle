'use client'

import { useQuery } from '@tanstack/react-query'
import { getTokensData } from '@/app/actions/tokens'
import ErrorPanel from '@/components/ErrorPanel'
import TokensActivityTable from '@/components/TokensActivityTable'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import useShowLoadingBar from '@/hooks/useShowLoadingBar'

export default function TokensPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['tokens'],
    queryFn: getTokensData,
  })

  useShowLoadingBar(isLoading)
  if (error && !isLoading) {
    return <ErrorPanel error={error} />
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Activity overview</CardTitle>
          <CardDescription>Ranked by volume and transaction count</CardDescription>
        </CardHeader>
        <CardContent>
          <TokensActivityTable tokens={data?.tokens || []} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  )
}
