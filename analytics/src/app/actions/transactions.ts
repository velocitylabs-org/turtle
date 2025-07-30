'use server'
import { transactionsPerPage } from '@/constants'
import Transaction, { txStatusOptions } from '@/models/Transaction'
import { TxStatus } from '@/models/Transaction'
import transactionView from '@/models/transaction-view'
import captureServerError from '@/utils/capture-server-error'
import dbConnect from '@/utils/db-connect'

type TransactionFilters = {
  sourceChainUid?: string
  destinationChainUid?: string
  sourceTokenId?: string
  destinationTokenId?: string
  status?: TxStatus | null
  startDate?: Date
  endDate?: Date
  hostedOn?: string
  senderAddress?: string
  recipientAddress?: string
  page: number
}

export async function getTransactionsData({
  sourceChainUid,
  destinationChainUid,
  sourceTokenId,
  destinationTokenId,
  status,
  startDate,
  endDate,
  hostedOn,
  senderAddress,
  recipientAddress,
  page = 1,
}: TransactionFilters) {
  try {
    await dbConnect()

    interface MongoQuery {
      sourceChainUid?: string
      destinationChainUid?: string
      sourceTokenId?: string
      destinationTokenId?: string
      status?: TxStatus
      txDate?: {
        $gte?: Date
        $lte?: Date
      }
      hostedOn?: { $regex: RegExp }
      senderAddress?: string
      recipientAddress?: string
    }

    const query: MongoQuery = {}

    if (sourceChainUid) {
      query.sourceChainUid = sourceChainUid
    }

    if (destinationChainUid) {
      query.destinationChainUid = destinationChainUid
    }

    if (sourceTokenId) {
      query.sourceTokenId = sourceTokenId
    }

    if (destinationTokenId) {
      query.destinationTokenId = destinationTokenId
    }

    if (status) {
      if (txStatusOptions.includes(status)) {
        query.status = status as TxStatus
      }
    }

    if (hostedOn) {
      query.hostedOn = { $regex: new RegExp(hostedOn, 'i') }
    }

    if (startDate || endDate) {
      query.txDate = {}
      if (startDate) {
        query.txDate.$gte = new Date(startDate)
      }
      if (endDate) {
        query.txDate.$lte = new Date(endDate)
      }
    }

    if (senderAddress) {
      query.senderAddress = senderAddress
    }

    if (recipientAddress) {
      query.recipientAddress = recipientAddress
    }

    const [filteredTransactions, totalVolumeUsd, statusCounts] = await Promise.all([
      // Retrieve the transactions, limiting results to transactionsPerPage and page number
      Transaction.find(query)
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
        .lean(),

      // Calculate total volume
      Transaction.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$sourceTokenAmountUsd' } } },
      ]),

      // Get status counts
      Transaction.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
    ])

    interface StatusMap {
      succeeded: number
      failed: number
      undefined: number
      ongoing: number
      total: number
      [key: string]: number
    }

    interface StatusCount {
      _id: string
      count: number
    }

    const statusMap = statusCounts.reduce<StatusMap>(
      (acc, curr: StatusCount) => {
        acc[curr._id] = curr.count
        acc.total += curr.count
        return acc
      },
      {
        succeeded: 0,
        failed: 0,
        undefined: 0,
        ongoing: 0,
        total: 0,
      },
    )

    // Ensure all values are serializable because actions can only return plain objects
    const serializedTransactions = filteredTransactions.map(transaction =>
      transactionView.parse(transaction),
    )

    return {
      transactions: serializedTransactions,
      summary: {
        totalVolumeUsd: totalVolumeUsd[0]?.total || 0,
        totalTransactions: statusMap.total,
        succeededCount: statusMap.succeeded,
        failedCount: statusMap.failed,
        undefinedCount: statusMap.undefined,
        ongoingCount: statusMap.ongoing,
      },
    }
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e))
    await captureServerError(error)
    throw error
  }
}
