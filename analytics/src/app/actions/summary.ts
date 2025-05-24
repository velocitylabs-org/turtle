'use server'
import Transaction from '@/models/Transaction'
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
      topTokensResult,
      dailyVolumeResult,
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
            volumeUsd: { $sum: '$sourceTokenAmountUsd' },
            count: { $sum: 1 },
          },
        },
        { $sort: { volumeUsd: -1 } },
        { $limit: 2 },
        {
          $project: {
            _id: 0,
            id: '$_id',
            symbol: 1,
            name: 1,
            volumeUsd: 1,
            count: 1,
          },
        },
      ]),

      // Monthly volume for the last 6 months
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

    // Ensure all values are serializable because actions can only return plain objects
    const serializedRecentTransactions = recentTransactions.map(transaction => ({
      ...transaction,
      _id: transaction._id?.toString(),
      txDate: transaction.txDate?.toISOString(),
    }))

    return {
      totalVolumeUsd,
      totalTransactions,
      avgTransactionValue,
      successRate,
      recentTransactions: serializedRecentTransactions,
      topTokens: topTokensResult,
      dailyVolume: dailyVolumeResult,
    }
  } catch (error) {
    captureServerError(error as Error)
    throw error
  }
}
