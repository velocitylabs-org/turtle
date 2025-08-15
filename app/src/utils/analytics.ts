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
  const destinationTokenAmount = transferParams.destinationAmount
    ? toHuman(transferParams.destinationAmount, transferParams.destinationToken)
    : undefined

  // TODO: Update database schema to support storing an array of fees with individual properties instead of splitting into regular and bridging fees
  // Separate regular fees from bridging fees
  const regularFees = transferParams.fees.filter(fee => fee.title !== 'Bridging fees')
  const bridgingFees = transferParams.fees.filter(fee => fee.title === 'Bridging fees')

  // Calculate total regular fees (sum all non-bridging fees)
  const totalRegularFeesUsd = regularFees.reduce((sum, fee) => sum + fee.amount.inDollars, 0)

  // Get the first regular fee for token info
  const regularFeeInfo = regularFees[0]
  const feesAmount = regularFeeInfo
    ? regularFees.reduce((sum, fee) => sum + Number(toHuman(fee.amount.amount, fee.amount.token)), 0)
    : 0

  // Calculate bridging fees if they exist
  const bridgingFeeInfo = bridgingFees[0]
  const bridgingFeeAmount = bridgingFeeInfo
    ? bridgingFees.reduce((sum, fee) => sum + Number(toHuman(fee.amount.amount, fee.amount.token)), 0)
    : undefined
  const totalBridgingFeesUsd = bridgingFees.reduce((sum, fee) => sum + fee.amount.inDollars, 0) || undefined

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

    feesTokenId: regularFeeInfo?.amount.token.id,
    feesTokenName: regularFeeInfo?.amount.token.name,
    feesTokenSymbol: regularFeeInfo?.amount.token.symbol,
    feesTokenAmount: feesAmount,
    feesTokenAmountUsd: totalRegularFeesUsd,
    feesTokenAmountRaw: regularFeeInfo
      ? regularFees.reduce((sum, fee) => sum + BigInt(fee.amount.amount), 0n).toString()
      : '0',

    bridgingFeeTokenId: bridgingFeeInfo?.amount.token.id,
    bridgingFeeTokenName: bridgingFeeInfo?.amount.token.name,
    bridgingFeeTokenSymbol: bridgingFeeInfo?.amount.token.symbol,
    bridgingFeeTokenAmount: bridgingFeeAmount,
    bridgingFeeTokenAmountUsd: totalBridgingFeesUsd,
    bridgingFeeAmountRaw: bridgingFeeInfo
      ? bridgingFees.reduce((sum, fee) => sum + BigInt(fee.amount.amount), 0n).toString()
      : undefined,

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
