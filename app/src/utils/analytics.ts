import { metrics } from '@sentry/nextjs'
import { track } from '@vercel/analytics/react'

export interface TransferMetric {
  sender: string
  sourceChain: string
  token: string
  amount: string
  destinationChain: string
  usdValue: number
  usdFees: number
  recipient: string
  date: string
}

export const trackTransferMetrics = (data: TransferMetric) => {
  trackTransferVercel(data)
  trackTransferSentry(data)
}

const trackTransferVercel = (data: TransferMetric) => {
  track('Transfer', {
    sender: data.sender,
    sourceChain: data.sourceChain,
    token: data.token,
    amount: data.amount,
    destinationChain: data.destinationChain,
    usdValue: data.usdValue,
    usdFees: data.usdFees,
    recipient: data.recipient,
    date: data.date,
  })
}

const trackTransferSentry = (data: TransferMetric) => {
  // Track the number of transfers (counter)
  metrics.increment('transfer_count', 1, {
    tags: {
      sender: data.sender,
      source_chain: data.sourceChain,
      destination_chain: data.destinationChain,
      token: data.token,
    },
  })

  // Track the USD value of the transfer (gauge)
  metrics.gauge('transfer_usd_value', data.usdValue, {
    tags: {
      source_chain: data.sourceChain,
      destination_chain: data.destinationChain,
      token: data.token,
    },
    unit: 'USD',
  })

  // Track the fees in USD (gauge)
  metrics.gauge('transfer_usd_fees', data.usdFees, {
    tags: {
      source_chain: data.sourceChain,
      destination_chain: data.destinationChain,
      token: data.token,
    },
    unit: 'USD',
  })

  // Track unique senders (set)
  metrics.set('unique_senders', data.sender)
}
