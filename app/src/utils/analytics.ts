import { captureException } from '@sentry/nextjs'

import { AmountInfo } from '@/models/transfer'
import { Chain } from '@/models/chain'
import { Environment } from '@/store/environmentStore'
import { Token } from '@/models/token'
import { isProduction } from '@/utils/env'
import { toHuman } from '@/utils/transfer'
import { track } from '@vercel/analytics'

type AllowedPropertyValues = string | number | boolean | null;

export interface TransferMetric {
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
}

export async function trackTransferMetrics(data: TransferMetric) {
  const obj: Record<string, AllowedPropertyValues> = {
    'tokenName': data.token.name,
    'tokenSymbol': data.token.symbol,
    'tokenAmount': toHuman(data.amount, data.token),
    'tokenAmountUsd': toHuman(data.amount, data.token) * data.tokenUSDValue,

    'feesTokenName': data.fees.token.name,
    'feesTokenSymbol': data.fees.token.symbol,
    'feesAmount': toHuman(data.fees.amount, data.fees.token),
    'feesAmountUsd': data.fees.inDollars,

    'senderAddress': data.sender,
    'sourceChainName': data.sourceChain.name,
    'sourceChainNetwork': data.sourceChain.network,

    'recipientAddress': data.recipient,
    'destinationChainName': data.destinationChain.name,
    'destinationChainNetwork': data.destinationChain.network,

    'date': data.date.toString(),

    // Additional info for debugging.
    'txId': data.id ?? '',
    'appHostedOn': window.location.origin,
    'amount': data.amount.toString(),
    'currentTokenPriceUSD': data.tokenUSDValue,
}
track("Test Track Sent Tx", { ...obj });

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
