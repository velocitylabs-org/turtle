'use client'
import { tokensById } from '@velocitylabs-org/turtle-registry'
import React from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, TooltipProps } from 'recharts'
import TokenAndOriginLogos from '@/components/TokenAndOriginLogos'
import { GraphType } from '@/constants'
import useIsMobile from '@/hooks/useMobile'
import formatPercentage from '@/utils/format-percentage'
import formatUSD from '@/utils/format-USD'
import getTypeBadge from '@/utils/get-type-badge'

interface TopTokensChartProps {
  data?: { symbol: string; volume?: number; count?: number; id: string }[]
  total: number
  type: GraphType
}

export default function TopTokensChart({ data = [], type, total = 0 }: TopTokensChartProps) {
  const typeVolume = type === 'volume'
  const isMobile = useIsMobile()

  const formattedData = data.map(item => {
    const value = typeVolume ? (item.volume ?? 0) : (item.count ?? 0)

    return {
      name: item.symbol,
      value,
      percentage: (value / total) * 100,
      id: item.id,
    }
  })

  // Calculate the sum of the displayed tokens
  const displayedValue = formattedData.reduce((sum, item) => sum + item.value, 0)

  // Calculate the remaining value for all other tokens
  const remainingValue = total - displayedValue
  const remainingPercentage = (remainingValue / total) * 100

  if (remainingPercentage > 0) {
    formattedData.push({
      name: 'Rest',
      value: remainingValue,
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
            {formattedData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip total={total} typeVolume={typeVolume} />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

const colors = [
  '#0077da',
  '#32a27e',
  '#f91033',
  '#9eadc5', // Rest tokens
]

interface CustomTooltip {
  active?: boolean
  payload?: TooltipProps<number, string>['payload']
  total: number
  typeVolume: boolean
}

interface PieLabelProps {
  id: string
  x: number
  y: number
  cx: number // center x
  cy: number // center y
}

function PieLabel({ id, x, y, cx, cy }: PieLabelProps) {
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

  // Calculate the angle from center to label position
  const angle = Math.atan2(y - cy, x - cx)

  // Calculate distance from the center
  const distance = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2))
  const padding = 5 // Adjust this value to control how far labels are from the pie
  const newDistance = distance + padding

  // Calculate the new position
  const newX = cx + Math.cos(angle) * newDistance
  const newY = cy + Math.sin(angle) * newDistance

  const { logoURI, typeURI } = getTypeBadge(id)
  return (
    <g transform={`translate(${newX - 16},${newY - 16})`}>
      <foreignObject width="32" height="32">
        <TokenAndOriginLogos tokenURI={logoURI as string} originURI={typeURI as string} size={28} />
      </foreignObject>
    </g>
  )
}

const CustomTooltip = ({ active, payload, total, typeVolume }: CustomTooltip) => {
  if (!active || !payload || !payload.length) {
    return null
  }

  const data = payload[0]
  const tokenId = data?.payload?.id
  const token = tokenId && tokensById[tokenId]
  return (
    <div className="min-w-[8rem] rounded-lg border bg-background p-2 text-xs shadow-xl">
      <span className="font-medium">{data.name} </span>
      {data?.value && <span>({formatPercentage((data.value / total) * 100)}%)</span>}
      <p className="text-muted-foreground">
        {typeVolume ? `$${formatUSD(data?.value)}` : `${data?.value} transactions`}
      </p>
      {token && <p className="text-[10px]">({token.origin.type})</p>}
    </div>
  )
}
