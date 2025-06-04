'use server'
import Transaction from '@/models/Transaction'
import transactionView from '@/models/transaction-view'
import captureServerError from '@/utils/capture-server-error'
import dbConnect from '@/utils/db-connect'

export async function getSummaryData() {
  try {
    await dbConnect()

    const [
      volumeResult,
      totalTransactions,
      successfulTransactions,
      recentTransactions,
      topTokensByVolume,
      topTokensByCount,
      monthlyTransByVolumeAndCount,
    ] = await Promise.all([
      // Total volume in USD
      Transaction.aggregate([
        { $match: { status: 'succeeded' } },
        {
          $group: {
            _id: null,
            total: { $sum: '$sourceTokenAmountUsd' },
          },
        },
      ]),

      // Total number of transactions
      Transaction.countDocuments(),

      // Successful transactions count
      Transaction.countDocuments({ status: 'succeeded' }),

      // Last 5 transactions
      Transaction.find()
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
        )
        .lean(),

      // Top 2 tokens by volume
      Transaction.aggregate([
        {
          $match: {
            status: 'succeeded',
          },
        },
        {
          $group: {
            _id: '$sourceTokenId', // Group only by sourceTokenId
            symbol: { $first: '$sourceTokenSymbol' },
            name: { $first: '$sourceTokenName' },
            volume: { $sum: '$sourceTokenAmountUsd' },
          },
        },
        { $sort: { volume: -1 } },
        { $limit: 2 },
        {
          $project: {
            _id: 0,
            id: '$_id',
            symbol: 1,
            name: 1,
            volume: 1,
          },
        },
      ]),

      // Top 2 tokens by transaction count
      Transaction.aggregate([
        {
          $match: {
            status: 'succeeded',
          },
        },
        {
          $group: {
            _id: '$sourceTokenId', // Group only by sourceTokenId
            symbol: { $first: '$sourceTokenSymbol' },
            name: { $first: '$sourceTokenName' },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 2 },
        {
          $project: {
            _id: 0,
            id: '$_id',
            symbol: 1,
            name: 1,
            count: 1,
          },
        },
      ]),

      // Monthly trans by volume and transaction count, for the last 6 months
      Transaction.aggregate([
        {
          $match: {
            txDate: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
            },
            status: 'succeeded',
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m',
                date: '$txDate',
              },
            },
            volumeUsd: { $sum: '$sourceTokenAmountUsd' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: 0,
            month: '$_id',
            volumeUsd: 1,
            count: 1,
          },
        },
      ]),
    ])

    const totalVolumeUsd = volumeResult[0]?.total || 0
    const successRate =
      totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0
    const avgTransactionValue =
      successfulTransactions > 0 ? totalVolumeUsd / successfulTransactions : 0

    // Apply the schema to each transaction
    const serializedRecentTransactions = recentTransactions.map(transaction =>
      transactionView.parse(transaction),
    )

    return {
      totalVolumeUsd,
      totalTransactions,
      avgTransactionValue,
      successRate,
      recentTransactions: serializedRecentTransactions,
      topTokensByVolume,
      topTokensByCount,
      monthlyTransByVolumeAndCount,
    }
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e))
    await captureServerError(error)
    throw error
  }
}
