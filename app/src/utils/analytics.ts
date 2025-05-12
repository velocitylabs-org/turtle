import { captureException } from '@sentry/nextjs'

import { Environment } from '@velocitylabs-org/turtle-registry'
import { Chain } from '@/models/chain'

import { Token } from '@/models/token'
import { AmountInfo } from '@/models/transfer'
import { isProduction } from '@/utils/env'
import { toHuman } from '@/utils/transfer'

interface TransferMetric {
  environment: Environment

  token: Token
  fees: AmountInfo
  sender: string
  sourceChain: Chain
  recipient: string
  destinationChain: Chain
  date: Date

  id?: string
  amount: bigint
  tokenUSDValue: number

  destinationToken?: Token
  destinationTokenUSDValue?: number
  destinationAmount?: bigint
  bridgingFee?: AmountInfo | null | undefined
}

export async function trackTransferMetrics(data: TransferMetric) {
  if (
    !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    data.environment !== Environment.Mainnet ||
    !isProduction
  ) {
    return
  }

  const databaseUrl =
    'https://firestore.googleapis.com/v1/projects/' +
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID +
    '/databases/(default)/documents/turtle-txs'

  const userData = {
    fields: {
      tokenName: { stringValue: data.token.name },
      tokenSymbol: { stringValue: data.token.symbol },
      tokenAmount: { doubleValue: toHuman(data.amount, data.token) },
      tokenAmountUsd: {
        doubleValue: toHuman(data.amount, data.token) * data.tokenUSDValue,
      },

      feesTokenName: { stringValue: data.fees.token.name },
      feesTokenSymbol: { stringValue: data.fees.token.symbol },
      feesAmount: { doubleValue: toHuman(data.fees.amount, data.fees.token) },
      feesAmountUsd: { doubleValue: data.fees.inDollars },

      senderAddress: { stringValue: data.sender },
      sourceChainName: { stringValue: data.sourceChain.name },
      sourceChainNetwork: { stringValue: data.sourceChain.network },

      recipientAddress: { stringValue: data.recipient },
      destinationChainName: { stringValue: data.destinationChain.name },
      destinationChainNetwork: { stringValue: data.destinationChain.network },

      date: { timestampValue: { seconds: Math.floor(data.date.getTime() / 1000) } },

      // Additional info for debugging.
      txId: { stringValue: data.id ?? '' },
      appHostedOn: { stringValue: window.location.origin },
      amount: { stringValue: data.amount.toString() },
      currentTokenPriceUSD: { doubleValue: data.tokenUSDValue },
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
