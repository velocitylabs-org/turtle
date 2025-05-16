'use client'
import React from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, TooltipProps } from 'recharts'
import formatUSD from '@/utils/format-USD'
import { tokensById } from '@/constants'
import TokenAndOriginLogos from '@/components/TokenAndOriginLogos'
import getTypeBadge from '@/utils/get-type-badge'
import useIsMobile from '@/hooks/useMobile'

const colors = [
  '#0077da',
  '#f91033',
  '#9eadc5', // Rest tokens
]

interface TopTokensChartProps {
  data: { symbol: string; volumeUsd: number; id: string }[]
  totalVolume: number
}

interface CustomTooltip {
  active?: boolean
  payload?: TooltipProps<number, string>['payload']
  totalVolume: number
}

interface PieLabelProps {
  id: string
  x: number
  y: number
}

function PieLabel({ id, x, y }: PieLabelProps) {
  if (id === 'rest-tokens') {
    return (
      <text
        x={x}
        y={y}
        fill={colors[colors.length - 1]}
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        Rest
      </text>
    )
  }

  const { logoURI, typeURI } = getTypeBadge(id)
  return (
    <g transform={`translate(${x - 20},${y - 13})`}>
      <foreignObject width="32" height="32">
        <TokenAndOriginLogos tokenURI={logoURI} originURI={typeURI || undefined} size={28} />
      </foreignObject>
    </g>
  )
}

const CustomTooltip = ({ active, payload, totalVolume }: CustomTooltip) => {
  if (!active || !payload || !payload.length) {
    return null
  }

  const data = payload[0]
  const tokenId = data?.payload?.id
  const token = tokenId && tokensById[tokenId]
  return (
    <div className="min-w-[8rem] rounded-lg border bg-background p-2 text-xs shadow-xl">
      <span className="font-medium">{data.name} </span>
      {data?.value && <span>({((data.value / totalVolume) * 100).toFixed(2)}%)</span>}
      <p className="text-muted-foreground">${formatUSD(data?.value)}</p>
      {token && <p className="text-[10px]">({token.origin.type})</p>}
    </div>
  )
}

export default function TopTokensChart({ data, totalVolume }: TopTokensChartProps) {
  const isMobile = useIsMobile()
  const formattedData = data.map(item => ({
    name: item.symbol,
    value: item.volumeUsd,
    percentage: (item.volumeUsd / totalVolume) * 100,
    id: item.id,
  }))

  // Calculate the sum of the displayed tokens volumes
  const displayedVolume = formattedData.reduce((sum, item) => sum + item.value, 0)

  // Calculate the remaining volume for all other tokens
  const remainingVolume = totalVolume - displayedVolume
  const remainingPercentage = (remainingVolume / totalVolume) * 100

  if (remainingPercentage > 0) {
    formattedData.push({
      name: 'Rest tokens',
      value: remainingVolume,
      percentage: remainingPercentage,
      id: 'rest-tokens',
    })
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={formattedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            dataKey="value"
            nameKey="name"
            label={props => (isMobile ? props.name : <PieLabel {...props} />)}
          >
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip totalVolume={totalVolume} />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
