import { captureException } from '@sentry/nextjs'

import { Environment } from '@velocitylabs-org/turtle-registry'

import { TransferParams } from '@/hooks/useTransfer'
import { isProduction } from '@/utils/env'
import { toHuman } from '@/utils/transfer'

interface TransferMetric {
  transferParams: TransferParams
  senderAddress: string
  sourceTokenUSDValue: number
  destinationTokenUSDValue: number
  txId?: string
  date: Date
}

export async function trackTransferMetrics({
  transferParams,
  txId,
  senderAddress,
  sourceTokenUSDValue,
  date,
}: TransferMetric) {
  if (
    !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    transferParams.environment !== Environment.Mainnet ||
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
      tokenName: { stringValue: transferParams.sourceToken.name },
      tokenSymbol: { stringValue: transferParams.sourceToken.symbol },
      tokenAmount: {
        doubleValue: toHuman(transferParams.sourceAmount, transferParams.sourceToken),
      },
      tokenAmountUsd: {
        doubleValue:
          toHuman(transferParams.sourceAmount, transferParams.sourceToken) * sourceTokenUSDValue,
      },

      feesTokenName: { stringValue: transferParams.fees.token.name },
      feesTokenSymbol: { stringValue: transferParams.fees.token.symbol },
      feesAmount: { doubleValue: toHuman(transferParams.fees.amount, transferParams.fees.token) },
      feesAmountUsd: { doubleValue: transferParams.fees.inDollars },

      senderAddress: { stringValue: senderAddress },
      sourceChainName: { stringValue: transferParams.sourceChain.name },
      sourceChainNetwork: { stringValue: transferParams.sourceChain.network },

      recipientAddress: { stringValue: transferParams.recipient },
      destinationChainName: { stringValue: transferParams.destinationChain.name },
      destinationChainNetwork: { stringValue: transferParams.destinationChain.network },

      date: { timestampValue: { seconds: Math.floor(date.getTime() / 1000) } },

      // Additional info for debugging.
      txId: { stringValue: txId ?? '' },
      appHostedOn: { stringValue: window.location.origin },
      amount: { stringValue: transferParams.sourceAmount.toString() },
      currentTokenPriceUSD: { doubleValue: sourceTokenUSDValue },
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
