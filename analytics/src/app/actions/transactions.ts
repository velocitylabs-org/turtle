'use server'
import Transaction from '@/models/Transaction'
import { txStatus } from '@/models/Transaction'
import captureServerError from '@/utils/capture-server-error'
import dbConnect from '@/utils/db-connect'

type TransactionFilters = {
  sourceChainUid?: string[]
  destinationChainUid?: string[]
  sourceTokenId?: string[]
  destinationTokenId?: string[]
  status?: txStatus | null
  startDate?: Date
  endDate?: Date
}

export async function getTransactionsData({
  sourceChainUid,
  destinationChainUid,
  sourceTokenId,
  destinationTokenId,
  status,
  startDate,
  endDate,
}: TransactionFilters) {
  try {
    await dbConnect()

    interface MongoQuery {
      sourceChainUid?: { $regex: RegExp }
      destinationChainUid?: { $regex: RegExp }
      sourceTokenId?: { $regex: RegExp }
      destinationTokenId?: { $regex: RegExp }
      status?: 'succeeded' | 'failed' | 'undefined'
      txDate?: {
        $gte?: Date
        $lte?: Date
      }
    }

    const query: MongoQuery = {}

    if (sourceChainUid?.length) {
      query.sourceChainUid = { $regex: new RegExp(sourceChainUid.join('|'), 'i') }
    }

    if (destinationChainUid?.length) {
      query.destinationChainUid = { $regex: new RegExp(destinationChainUid.join('|'), 'i') }
    }

    if (sourceTokenId?.length) {
      query.sourceTokenId = { $regex: new RegExp(sourceTokenId.join('|'), 'i') }
    }

    if (destinationTokenId?.length) {
      query.destinationTokenId = { $regex: new RegExp(destinationTokenId.join('|'), 'i') }
    }

    if (status) {
      if (['succeeded', 'failed', 'undefined'].includes(status)) {
        query.status = status as 'succeeded' | 'failed' | 'undefined'
      }
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

    const [filteredTransactions, totalVolumeUsd, statusCounts] = await Promise.all([
      // Get latest 5 transactions
      Transaction.find(query)
        .sort({ txDate: -1 })
        .limit(5)
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
        ),

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
      [key: string]: number
    }

    interface StatusCount {
      _id: string
      count: number
    }

    // Process status counts
    const statusMap = statusCounts.reduce<StatusMap>(
      (acc, curr: StatusCount) => {
        acc[curr._id] = curr.count
        return acc
      },
      {
        succeeded: 0,
        failed: 0,
        undefined: 0,
      },
    )

    return {
      transactions: filteredTransactions,
      summary: {
        totalVolumeUsd: totalVolumeUsd[0]?.total || 0,
        totalTransactions: Object.values(statusMap).reduce((a: number, b: number) => a + b, 0),
        succeededCount: statusMap.succeeded,
        failedCount: statusMap.failed,
        undefinedCount: statusMap.undefined,
      },
    }
  } catch (error) {
    captureServerError(error as Error)
    throw error
  }
}
