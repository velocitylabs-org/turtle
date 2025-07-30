'use server'
import { transactionsPerPage } from '@/constants'
import Transaction from '@/models/Transaction'
import transactionView from '@/models/transaction-view'
import captureServerError from '@/utils/capture-server-error'
import dbConnect from '@/utils/db-connect'

export async function getTxList(page: number = 1) {
  try {
    await dbConnect()

    // Retrieve the latest transactions with pagination
    const recentTransactions = await Transaction.find()
      .sort({ txDate: -1 })
      .skip((page - 1) * transactionsPerPage)
      .limit(transactionsPerPage)
      .select(
        [
          '_id',
          Transaction.schema.paths.txDate.path,
          Transaction.schema.paths.sourceTokenId.path,
          Transaction.schema.paths.sourceTokenSymbol.path,
          Transaction.schema.paths.sourceTokenAmount.path,
          Transaction.schema.paths.sourceTokenAmountUsd.path,
          Transaction.schema.paths.sourceChainUid.path,
          Transaction.schema.paths.sourceChainName.path,
          Transaction.schema.paths.destinationTokenId.path,
          Transaction.schema.paths.destinationTokenSymbol.path,
          Transaction.schema.paths.destinationChainUid.path,
          Transaction.schema.paths.destinationChainName.path,
          Transaction.schema.paths.status.path,
        ].join(' '),
      )
      .lean()

    // Apply the schema to each transaction
    const serializedRecentTransactions = recentTransactions.map(transaction =>
      transactionView.parse(transaction),
    )

    return {
      txList: serializedRecentTransactions,
    }
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e))
    await captureServerError(error)
    throw error
  }
}
