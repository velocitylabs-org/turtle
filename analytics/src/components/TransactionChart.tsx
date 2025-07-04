'use client'
import React from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts'
import { GraphType, primaryColor } from '@/constants'
import formatUSD from '@/utils/format-USD'

const chartColor = primaryColor

interface TransactionChartProps {
  data: { timestamp: string; volumeUsd: number; count: number }[]
  type: GraphType
  timeRange: 'last-6-months' | 'last-month' | 'this-week'
}

export default function TransactionChart({ data, type, timeRange }: TransactionChartProps) {
  const formattedData = data
    .map(item => {
      let dateStr: string
      const date = new Date(item.timestamp)

      if (timeRange === 'last-6-months') {
        // Format for 6-month view (YYYY-MM) - show month name
        dateStr = date.toLocaleDateString('en-US', { month: 'short' })
      } else if (timeRange === 'last-month') {
        // Format for last month view (YYYY-MM-DD) - show day number
        dateStr = date.getDate().toString()
      } else if (timeRange === 'this-week') {
        // Format for this week view (YYYY-MM-DD) - show day name
        dateStr = date.toLocaleDateString('en-US', { weekday: 'short' })
      } else {
        dateStr = 'Unknown'
      }

      return {
        date: dateStr,
        value: type === 'volume' ? item.volumeUsd : item.count,
        timestamp: item.timestamp,
      }
    })
    .filter(item => item !== null)

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formattedData} margin={{ top: 10, left: 30, right: 25, bottom: 10 }}>
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            tick={{ fontSize: timeRange === 'last-month' ? 13 : 15 }}
            interval={0}
          />
          <YAxis
            tickFormatter={value => (type === 'volume' ? `$${(value / 1000).toFixed(0)}k` : value)}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
          />
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <Tooltip content={<CustomTooltip type={type} timeRange={timeRange} />} />
          <Bar
            dataKey="value"
            fill={chartColor}
            minPointSize={1}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

const CustomTooltip = ({
  active,
  payload,
  label,
  type,
  timeRange,
}: TooltipProps<number, string> & {
  type: GraphType
  timeRange: 'last-6-months' | 'last-month' | 'this-week'
}) => {
  if (!active || !payload || !payload.length) {
    return null
  }

  let displayLabel = label

  const timestamp = payload[0].payload.timestamp
  const date = timestamp && new Date(timestamp)
  if (timeRange === 'last-month' && timestamp) {
    const day = date.getDate()
    const suffix = getDaySuffix(day)
    displayLabel = `${date.toLocaleDateString('en-US', { month: 'long' })} ${day}${suffix}`
  }

  if (timeRange === 'last-6-months' && timestamp) {
    displayLabel = date.toLocaleDateString('en-US', { month: 'long' })
  }

  if (timeRange === 'this-week' && timestamp) {
    const day = date.getDate()
    const suffix = getDaySuffix(day)
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' })
    displayLabel = `${weekday} ${day}${suffix}`
  }

  return (
    <div className="min-w-[8rem] rounded-lg border bg-background p-2 text-xs shadow-xl">
      <p className="font-medium">{displayLabel}</p>
      {type === 'volume' ? (
        <p className="text-muted-foreground">${formatUSD(payload[0].value)}</p>
      ) : (
        <p className="text-muted-foreground">{payload[0].value} transactions</p>
      )}
    </div>
  )
}

function getDaySuffix(day: number): string {
  if (day > 3 && day < 21) return 'th'
  switch (day % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}
