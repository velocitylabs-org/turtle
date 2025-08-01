'use client'

import { captureException } from '@sentry/nextjs'

import storeAnalyticsTransaction from '@/app/actions/store-transactions'
import updateAnalyticsTxStatus from '@/app/actions/update-transaction-status'
import type { TransferParams } from '@/hooks/useTransfer'
import { isProduction } from '@/utils/env'
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
  if (!isProduction || !txId) {
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
    destinationTokenAmountUsd: destinationTokenAmount ? destinationTokenAmount * destinationTokenUSDValue : undefined,
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
    status: 'ongoing',
    isSwap,
  }

  try {
    await storeAnalyticsTransaction(transactionData)
  } catch (error) {
    captureException(error, {
      tags: { section: 'analytics' },
      extra: transactionData,
    })
    console.error('Failed to store transaction:', error)
  }
}

interface TrackTransferMetricsParams {
  txHashId: string
  status: string
}

export async function updateTransferMetrics({ txHashId, status }: TrackTransferMetricsParams) {
  if (!isProduction || !txHashId || !status) {
    return
  }

  try {
    await updateAnalyticsTxStatus({ txHashId, status })
  } catch (error) {
    captureException(error, {
      tags: { section: 'analytics' },
      extra: { txHashId, status },
    })
    console.error('Failed to update transaction:', error)
  }
}
