'use server'
import { defaultTransactionLimit, swapsStartingDate } from '@/constants'
import swapView from '@/models/swap-view'
import Transaction from '@/models/Transaction'
import captureServerError from '@/utils/capture-server-error'
import dbConnect from '@/utils/db-connect'

export async function getSwapsData() {
  try {
    await dbConnect()

    const [
      swapsVolumeResult,
      totalSwaps,
      successfulSwaps,
      rawRecentSwaps,
      transactionsSinceSwaps,
      swapsActivity,
    ] = await Promise.all([
      // Total swaps volume in USD
      Transaction.aggregate([
        { $match: { status: 'succeeded', isSwap: true } },
        {
          $group: {
            _id: null,
            total: { $sum: '$sourceTokenAmountUsd' },
          },
        },
      ]),

      // Total number of swaps
      Transaction.countDocuments({ isSwap: true }),

      // Successful swaps count
      Transaction.countDocuments({ status: 'succeeded', isSwap: true }),

      // Retrieve the latest swaps, limiting results to defaultTransactionLimit
      Transaction.find({ isSwap: true })
        .sort({ txDate: -1 })
        .limit(defaultTransactionLimit)
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
            Transaction.schema.paths.destinationTokenAmount.path,
            Transaction.schema.paths.destinationTokenAmountUsd.path,
            Transaction.schema.paths.destinationChainUid.path,
            Transaction.schema.paths.destinationChainName.path,
            Transaction.schema.paths.status.path,
          ].join(' '),
        )
        .lean(),

      // Transactions since swaps
      Transaction.countDocuments({ txDate: { $gt: swapsStartingDate }, status: 'succeeded' }),

      // Swaps incoming and outgoing volume and transaction
      Transaction.aggregate([
        {
          $match: {
            status: 'succeeded',
            isSwap: true,
          },
        },
        // Outgoing data
        {
          $group: {
            _id: '$sourceTokenId',
            tokenId: { $first: '$sourceTokenId' },
            outgoingVolume: { $sum: '$sourceTokenAmountUsd' },
            outgoingTransactions: { $sum: 1 },
            incomingVolume: { $sum: 0 },
            incomingTransactions: { $sum: 0 },
          },
        },
        // Merge with incoming using
        {
          $unionWith: {
            coll: 'transactions',
            pipeline: [
              {
                $match: {
                  status: 'succeeded',
                  isSwap: true,
                },
              },
              {
                $group: {
                  _id: '$destinationTokenId',
                  tokenId: { $first: '$destinationTokenId' },
                  incomingVolume: { $sum: '$destinationTokenAmountUsd' },
                  incomingTransactions: { $sum: 1 },
                  outgoingVolume: { $sum: 0 },
                  outgoingTransactions: { $sum: 0 },
                },
              },
            ],
          },
        },
        {
          $group: {
            _id: '$tokenId',
            tokenId: { $first: '$tokenId' },
            incomingVolume: { $sum: '$incomingVolume' },
            incomingTransactions: { $sum: '$incomingTransactions' },
            outgoingVolume: { $sum: '$outgoingVolume' },
            outgoingTransactions: { $sum: '$outgoingTransactions' },
          },
        },
        {
          $addFields: {
            totalVolume: { $add: ['$incomingVolume', '$outgoingVolume'] },
            totalTransactions: { $add: ['$incomingTransactions', '$outgoingTransactions'] },
          },
        },
        {
          $sort: { totalVolume: -1 },
        },
        {
          $project: {
            _id: 0,
            tokenId: 1,
            incomingVolume: 1,
            incomingTransactions: 1,
            outgoingVolume: 1,
            outgoingTransactions: 1,
            totalVolume: 1,
            totalTransactions: 1,
          },
        },
      ]),
    ])

    const swapsTotalVolume = swapsVolumeResult[0]?.total || 0
    const swapsSuccessRate = totalSwaps > 0 ? (successfulSwaps / totalSwaps) * 100 : 0
    const swapsPercentageOfTransactions = (successfulSwaps * 100) / transactionsSinceSwaps

    // Ensure all values are serializable because actions can only return plain objects
    const recentSwaps = rawRecentSwaps.map(swap => swapView.parse(swap))

    return {
      swapsTotalVolume,
      successfulSwaps,
      swapsSuccessRate,
      recentSwaps,
      swapsPercentageOfTransactions,
      swapsActivity,
    }
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e))
    await captureServerError(error)
    throw error
  }
}
