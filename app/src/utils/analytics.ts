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
  date: Date
  txId?: string
}

export async function trackTransferMetrics({
  transferParams,
  txId,
  senderAddress,
  sourceTokenUSDValue,
  destinationTokenUSDValue,
  date,
}: TransferMetric) {
  if (
    !process.env.NEXT_PUBLIC_ANALYTICS_DASHBOARD_AUTH_TOKEN ||
    !process.env.NEXT_PUBLIC_ANALYTICS_DASHBOARD_BASE_URL ||
    transferParams.environment !== Environment.Mainnet ||
    !isProduction ||
    !txId
  ) {
    return
  }

  const apiUrl = `${process.env.NEXT_PUBLIC_ANALYTICS_DASHBOARD_BASE_URL}/api/create-transaction`
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

    txDate: date,
    hostedOn: window.location.origin,
    status: 'succeeded',
  }

  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: process.env.NEXT_PUBLIC_ANALYTICS_DASHBOARD_AUTH_TOKEN,
    },
    body: JSON.stringify(transactionData),
  }).catch(error => {
    captureException(error)
  })
}
