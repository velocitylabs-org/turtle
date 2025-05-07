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
import { primaryColor } from '@/constants'
import formatUSD from '@/utils/format-USD'

const chartColor = primaryColor

interface TransactionVolumeChartProps {
  data: { month: string; volumeUsd: number }[]
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (!active || !payload || !payload.length) {
    return null
  }

  return (
    <div className="min-w-[8rem] rounded-lg border bg-background p-2 text-xs shadow-xl">
      <p className="font-medium">{label}</p>
      <p className="text-muted-foreground">${formatUSD(payload[0].value)}</p>
    </div>
  )
}

export default function TransactionVolumeChart({ data }: TransactionVolumeChartProps) {
  const formattedData = data.map(item => ({
    date: new Date(item.month).toLocaleDateString('en-US', { month: 'short' }),
    volume: item.volumeUsd,
  }))

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
            tickFormatter={value => `$${(value / 1000).toFixed(0)}k`}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
          />
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="volume"
            stroke={chartColor}
            fillOpacity={1}
            fill="url(#colorVolume)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
