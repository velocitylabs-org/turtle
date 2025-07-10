'use client'

import { Environment } from '@velocitylabs-org/turtle-registry'
import { TransferParams } from '@/hooks/useTransfer'
import { TxStatus } from '@/models/transfer'
import {
  ANALYTICS_DASHBOARD_BASE_URL,
  isProduction,
  ANALYTICS_WIDGET_AUTH_TOKEN,
} from '@/utils/consts'
import { toHuman } from '@/utils/transfer'

interface TransferMetric {
  transferParams: TransferParams
  senderAddress: string
  sourceTokenUSDValue: number
  destinationTokenUSDValue: number
  date: Date
  isSwap?: boolean
  txId?: string
}

export async function trackTransferMetrics({
  transferParams,
  txId,
  senderAddress,
  sourceTokenUSDValue,
  destinationTokenUSDValue,
  date,
  isSwap = false,
}: TransferMetric) {
  if (transferParams.environment !== Environment.Mainnet || !isProduction || !txId) {
    return
  }

  const sourceTokenAmount = toHuman(transferParams.sourceAmount, transferParams.sourceToken)
  const feesAmount = toHuman(transferParams.fees.amount, transferParams.fees.token)
  const destinationTokenAmount = transferParams.destinationAmount
    ? toHuman(transferParams.destinationAmount, transferParams.destinationToken)
    : undefined
  const bridgingFeeAmount = transferParams.bridgingFee
    ? toHuman(transferParams.bridgingFee.amount, transferParams.bridgingFee.token)
    : undefined

  const transactionData = {
    txHashId: txId,

    sourceTokenId: transferParams.sourceToken.id,
    sourceTokenName: transferParams.sourceToken.name,
    sourceTokenSymbol: transferParams.sourceToken.symbol,
    sourceTokenAmount,
    sourceTokenAmountUsd: sourceTokenAmount * sourceTokenUSDValue,
    sourceTokenUSDValue: sourceTokenUSDValue,
    sourceTokenAmountRaw: transferParams.sourceAmount.toString(),

    destinationTokenId: transferParams.destinationToken.id,
    destinationTokenName: transferParams.destinationToken.name,
    destinationTokenSymbol: transferParams.destinationToken.symbol,

    destinationTokenAmount,
    destinationTokenAmountUsd: destinationTokenAmount
      ? destinationTokenAmount * destinationTokenUSDValue
      : undefined,
    destinationTokenUSDValue: destinationTokenUSDValue,
    destinationTokenAmountRaw: transferParams.destinationAmount?.toString(),

    feesTokenId: transferParams.fees.token.id,
    feesTokenName: transferParams.fees.token.name,
    feesTokenSymbol: transferParams.fees.token.symbol,
    feesTokenAmount: feesAmount,
    feesTokenAmountUsd: transferParams.fees.inDollars,
    feesTokenAmountRaw: transferParams.fees.amount.toString(),

    bridgingFeeTokenId: transferParams.bridgingFee?.token.id,
    bridgingFeeTokenName: transferParams.bridgingFee?.token.name,
    bridgingFeeTokenSymbol: transferParams.bridgingFee?.token.symbol,
    bridgingFeeTokenAmount: bridgingFeeAmount,
    bridgingFeeTokenAmountUsd: transferParams.bridgingFee?.inDollars,
    bridgingFeeAmountRaw: transferParams.bridgingFee?.amount.toString(),

    senderAddress,
    recipientAddress: transferParams.recipient,

    sourceChainUid: transferParams.sourceChain.uid,
    sourceChainId: transferParams.sourceChain.chainId,
    sourceChainName: transferParams.sourceChain.name,
    sourceChainNetwork: transferParams.sourceChain.network,

    destinationChainUid: transferParams.destinationChain.uid,
    destinationChainId: transferParams.destinationChain.chainId,
    destinationChainName: transferParams.destinationChain.name,
    destinationChainNetwork: transferParams.destinationChain.network,

    txDate: date.toISOString(),
    hostedOn: typeof window !== 'undefined' ? window.location.origin : '',
    status: TxStatus.Succeeded,
    isSwap,
  }

  try {
    if (!ANALYTICS_WIDGET_AUTH_TOKEN || !ANALYTICS_DASHBOARD_BASE_URL) {
      throw new Error('Analytics configuration missing')
    }

    const apiUrl = `${ANALYTICS_DASHBOARD_BASE_URL}/api/transaction`
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: ANALYTICS_WIDGET_AUTH_TOKEN,
      },
      body: JSON.stringify(transactionData),
    })

    if (!response.ok) {
      // Handle 409 conflict (duplicate transaction) as a non-error case
      if (response.status === 409) {
        return { success: true, info: 'Transaction already exists' }
      }

      const errorMessage = await parseAnalyticsServerActionError(response)
      const error = new Error(errorMessage)
      error.name = 'AnalyticsAPIError'
      throw error
    }
  } catch (error) {
    // captureException(error, {
    //   tags: { section: 'analytics' },
    //   extra: transactionData,
    // })
    console.error('Failed to store transaction:', error)
  }
}

interface TrackTransferMetricsParams {
  txHashId: string
  status: string
  environment: string
}

export async function updateTransferMetrics({
  txHashId,
  status,
  environment,
}: TrackTransferMetricsParams) {
  if (environment !== Environment.Mainnet || !isProduction || !txHashId || !status) {
    return
  }

  try {
    if (!ANALYTICS_WIDGET_AUTH_TOKEN || !ANALYTICS_DASHBOARD_BASE_URL) {
      throw new Error('Analytics configuration missing')
    }

    if (!txHashId || !status) {
      throw new Error('txHashId and status are required')
    }

    const apiUrl = `${ANALYTICS_DASHBOARD_BASE_URL}/api/transaction`
    const response = await fetch(apiUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: ANALYTICS_WIDGET_AUTH_TOKEN,
      },
      body: JSON.stringify({ txHashId, status }),
    })

    if (!response.ok) {
      const errorMessage = await parseAnalyticsServerActionError(response)
      const error = new Error(errorMessage)
      error.name = 'AnalyticsAPIError'
      throw error
    }
  } catch (error) {
    // captureException(error, {
    //   tags: { section: 'analytics' },
    //   extra: { txHashId, status },
    // })
    console.error('Failed to update transaction:', error)
  }
}

async function parseAnalyticsServerActionError(response: Response): Promise<string> {
  try {
    const errorData = await response.json()
    return errorData.message || errorData.error || 'Unknown API error'
  } catch {
    return `HTTP ${response.status}: ${response.statusText}`
  }
}
