'use client'
import { tokensById } from '@velocitylabs-org/turtle-registry'
import React from 'react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
  TooltipProps,
} from 'recharts'
import TokenAndOriginLogos from '@/components/TokenAndOriginLogos'
import { primaryColor } from '@/constants'
import formatUSD from '@/utils/format-USD'
import getTypeBadge from '@/utils/get-type-badge'

interface TokenData {
  tokenId: string
  totalVolume: number
  totalTransactions: number
}

interface TokensCountVolumeGraphProps {
  data: TokenData[]
  loading: boolean
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipProps<number, string>['payload']
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) {
    return null
  }

  const data = payload[0].payload
  const tokenId = data?.tokenId
  const token = tokenId && tokensById[tokenId]
  const { logoURI, typeURI } = getTypeBadge(tokenId)

  return (
    <div className="min-w-[8rem] rounded-lg border bg-background p-2 text-xs shadow-xl">
      <div className="inline-flex items-center">
        <TokenAndOriginLogos tokenURI={logoURI as string} originURI={typeURI as string} size={18} />
        <div className="-mt-[1px] ml-1 flex flex-col">
          <span className="text-xs font-medium">{token?.symbol}</span>
        </div>
      </div>
      <p className="text-muted-foreground">Transactions {data.x}</p>
      <p className="text-muted-foreground">Volume ${formatUSD(data.y)}</p>
    </div>
  )
}

export default function TokensCountVolumeGraph({ data, loading }: TokensCountVolumeGraphProps) {
  if (loading) {
    return (
      <div className="flex h-[320px] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  // Format data for the scatter chart
  const formattedData = data.map(token => ({
    x: token.totalTransactions,
    y: token.totalVolume,
    tokenId: token.tokenId,
  }))

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{
            top: 20,
            right: 20,
            bottom: 50,
            left: 75,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="x"
            name="Transactions"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
          >
            <Label value="Transaction count" offset={-30} position="insideBottom" />
          </XAxis>
          <YAxis
            type="number"
            dataKey="y"
            name="Volume"
            tickFormatter={value => `$${(value / 1000).toFixed(0)}k`}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
          >
            <Label value="Total volume" angle={-90} position="insideLeft" offset={-50} />
          </YAxis>
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <Scatter name="Tokens" data={formattedData} fill={primaryColor} shape="circle" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
