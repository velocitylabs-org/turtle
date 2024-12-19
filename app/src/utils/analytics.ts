import { captureException } from '@sentry/nextjs'
import { Environment } from '@/store/environmentStore'
import { isProduction } from '@/utils/env'

export interface TransferMetric {
  id?: string
  sender: string
  sourceChain: string
  token: string
  amount: string
  destinationChain: string
  usdValue: number
  usdFees: number
  recipient: string
  date: Date
  environment: Environment
}

export async function trackTransferMetrics(data: TransferMetric) {
  if (data.environment !== Environment.Mainnet || !isProduction) {
    return
  }

  const databaseUrl =
    'https://firestore.googleapis.com/v1/projects/' +
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID +
    '/databases/(default)/documents/' +
    process.env.NEXT_PUBLIC_FIREBASE_TX_COLLECTION_ID +
    '?' +
    new URLSearchParams({ documentId: data.id ?? crypto.randomUUID() }).toString()

  const hostedOn = window.location.origin

  const userData = {
    fields: {
      amount: { stringValue: data.amount },
      date: { timestampValue: { seconds: Math.floor(data.date.getTime() / 1000) } },
      destinationChain: { stringValue: data.destinationChain },
      recipient: { stringValue: data.recipient },
      sender: { stringValue: data.sender },
      sourceChain: { stringValue: data.sourceChain },
      token: { stringValue: data.token },
      usdFees: { doubleValue: data.usdFees },
      usdValue: { doubleValue: data.usdValue },
      hostedOn: { stringValue: hostedOn },
    },
  }

  fetch(databaseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  }).catch(error => {
    console.error('Error, was not able to log transaction to Firestore: ', error)
    captureException(error)
  })
}
