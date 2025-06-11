'use client'
import React from 'react'
import {
  Area,
  AreaChart,
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

const CustomTooltip = ({
  active,
  payload,
  label,
  type,
}: TooltipProps<number, string> & { type: GraphType }) => {
  if (!active || !payload || !payload.length) {
    return null
  }

  return (
    <div className="min-w-[8rem] rounded-lg border bg-background p-2 text-xs shadow-xl">
      <p className="font-medium">{label}</p>
      {type === 'volume' ? (
        <p className="text-muted-foreground">${formatUSD(payload[0].value)}</p>
      ) : (
        <p className="text-muted-foreground">{payload[0].value} transactions</p>
      )}
    </div>
  )
}

export default function TransactionChart({ data, type, timeRange }: TransactionChartProps) {
  const formattedData = data
    .map(item => {
      let dateStr: string
      const date = new Date(item.timestamp)

      if (timeRange === 'last-6-months') {
        // Format for 6 months view (YYYY-MM) - show month name
        dateStr = date.toLocaleDateString('en-US', { month: 'short' })
      } else if (timeRange === 'last-month') {
        // Format for last month view (YYYY-MM-DD) - show day number
        dateStr = date.getDate().toString()
      } else if (timeRange === 'this-week') {
        // Format for this week view (YYYY-MM-DD) - show day name
        dateStr = date.toLocaleDateString('en-US', { weekday: 'long' })
      } else {
        dateStr = 'Unknown'
      }

      return {
        date: dateStr,
        value: type === 'volume' ? item.volumeUsd : item.count,
      }
    })
    .filter(item => item !== null)

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData} margin={{ top: 10, left: 30, right: 25, bottom: 10 }}>
          <defs>
            <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColor} stopOpacity={0.8} />
              <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} />
          <YAxis
            tickFormatter={value => (type === 'volume' ? `$${(value / 1000).toFixed(0)}k` : value)}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
          />
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <Tooltip content={<CustomTooltip type={type} />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={chartColor}
            fillOpacity={1}
            fill="url(#colorVolume)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
