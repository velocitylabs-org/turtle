'use client'
import React from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts'
import TokenAndOriginLogos from '@/components/TokenAndOriginLogos'
import { GraphType } from '@/constants'
import formatPercentage from '@/utils/format-percentage'
import formatUSD from '@/utils/format-USD'
import getTypeBadge from '@/utils/get-type-badge'

export interface SwapPairData {
  pairName: string
  sourceTokenId: string
  destinationTokenId: string
  sourceTokenSymbol: string
  destinationTokenSymbol: string
  totalVolume: number
  totalTransactions: number
}

interface SwapPairsGraphProps {
  data: SwapPairData[]
  loading: boolean
  type: GraphType
  totalVolume: number
  totalSwaps: number
}

const colors = ['#2e4afb', '#22c55e', '#f59e0b', '#9eadc5']
const minimumFragmentPercentage = 1.5 // Minimum percentage threshold to ensure pie chart segments are visible

export default function SwapPairsGraph({
  data = [],
  loading,
  type,
  totalVolume,
  totalSwaps,
}: SwapPairsGraphProps) {
  if (loading) {
    return (
      <div className="flex h-[320px] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[320px] w-full items-center justify-center">
        <p className="text-muted-foreground">No swap pairs data available</p>
      </div>
    )
  }

  const isVolumeType = type === 'volume'
  const total = isVolumeType ? totalVolume : totalSwaps

  // Format data for the pie chart with percentages and minimum slice handling
  const formattedData = data.map((pair, index) => {
    const value = isVolumeType ? pair.totalVolume : pair.totalTransactions
    const percentage = (value / total) * 100

    return {
      ...pair,
      percentage: percentage,
      displayValue: Math.max(value, (total * minimumFragmentPercentage) / 100), // Ensure minimum display value
      fill: colors[index % colors.length],
    }
  })

  const displayedValue = formattedData.reduce(
    (sum, item) => sum + (isVolumeType ? item.totalVolume : item.totalTransactions),
    0,
  )

  // Calculate the remaining value for all other pairs
  const remainingValue = total - displayedValue
  const remainingPercentage = (remainingValue / total) * 100

  if (remainingPercentage > 0) {
    formattedData.push({
      pairName: 'Rest',
      sourceTokenId: 'rest-pairs',
      destinationTokenId: 'rest-pairs',
      sourceTokenSymbol: 'Rest',
      destinationTokenSymbol: 'Rest',
      totalVolume: isVolumeType ? remainingValue : 0,
      totalTransactions: isVolumeType ? 0 : remainingValue,
      percentage: remainingPercentage,
      displayValue: Math.max(remainingValue, (total * minimumFragmentPercentage) / 100),
      fill: colors[colors.length - 1],
    })
  }

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={formattedData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="displayValue"
            nameKey="pairName"
            labelLine={false}
            label={props => <SwapPairLabel {...props} />}
          >
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

interface SwapPairLabelProps {
  sourceTokenId: string
  destinationTokenId: string
  pairName: string
  x: number
  y: number
  cx: number
  cy: number
}

function SwapPairLabel({ sourceTokenId, destinationTokenId, x, y, cx, cy }: SwapPairLabelProps) {
  if (sourceTokenId === 'rest-pairs') {
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
  const padding = 16 // Adjust this value to control how far labels are from the pie
  const newDistance = distance + padding

  // Calculate the new position
  const newX = cx + Math.cos(angle) * newDistance
  const newY = cy + Math.sin(angle) * newDistance

  const sourceToken = getTypeBadge(sourceTokenId)
  const destinationToken = getTypeBadge(destinationTokenId)

  return (
    <g transform={`translate(${newX - 27},${newY - 11})`}>
      <foreignObject width="72" height="24">
        <div className="flex items-center gap-1">
          <TokenAndOriginLogos
            tokenURI={sourceToken.logoURI as string}
            originURI={sourceToken.typeURI as string}
            size={18}
          />
          <span className="text-xs text-muted-foreground">→</span>
          <TokenAndOriginLogos
            tokenURI={destinationToken.logoURI as string}
            originURI={destinationToken.typeURI as string}
            size={18}
          />
        </div>
      </foreignObject>
    </g>
  )
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

  return (
    <div className="min-w-[8rem] rounded-lg border bg-background p-2 text-xs shadow-xl">
      <div className="font-medium">{data.pairName}</div>
      <p className="text-muted-foreground">Volume: ${formatUSD(data.totalVolume)}</p>
      <p className="text-muted-foreground">Transactions: {data.totalTransactions}</p>
      <p className="text-muted-foreground">Share: {formatPercentage(data.percentage)}%</p>
    </div>
  )
}
