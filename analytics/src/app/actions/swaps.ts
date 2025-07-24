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
      swapPairsByVolume,
      swapPairsByTransactions,
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

      // Swaps activity - combined volume per token with network info
      Transaction.aggregate([
        {
          $match: {
            status: 'succeeded',
            isSwap: true,
          },
        },
        {
          $facet: {
            sourceTokens: [
              {
                $group: {
                  _id: {
                    tokenId: '$sourceTokenId',
                    chainName: '$sourceChainName',
                  },
                  tokenId: { $first: '$sourceTokenId' },
                  chainName: { $first: '$sourceChainName' },
                  totalVolume: { $sum: '$sourceTokenAmountUsd' },
                  totalTransactions: { $sum: 1 },
                },
              },
            ],
            destinationTokens: [
              {
                $group: {
                  _id: {
                    tokenId: '$destinationTokenId',
                    chainName: '$destinationChainName',
                  },
                  tokenId: { $first: '$destinationTokenId' },
                  chainName: { $first: '$destinationChainName' },
                  totalVolume: { $sum: '$destinationTokenAmountUsd' },
                  totalTransactions: { $sum: 1 },
                },
              },
            ],
          },
        },
        {
          $project: {
            combined: { $concatArrays: ['$sourceTokens', '$destinationTokens'] },
          },
        },
        { $unwind: '$combined' },
        { $replaceRoot: { newRoot: '$combined' } },
        {
          $group: {
            _id: {
              tokenId: '$tokenId',
              chainName: '$chainName',
            },
            tokenId: { $first: '$tokenId' },
            chainName: { $first: '$chainName' },
            totalVolume: { $sum: '$totalVolume' },
            totalTransactions: { $sum: '$totalTransactions' },
          },
        },
        { $sort: { totalVolume: -1 } },
        {
          $project: {
            _id: 0,
            tokenId: 1,
            chainName: 1,
            totalVolume: 1,
            totalTransactions: 1,
          },
        },
      ]),

      // Swap pairs data by volume (top 3 trading pairs by volume)
      Transaction.aggregate([
        {
          $match: {
            status: 'succeeded',
            isSwap: true,
          },
        },
        {
          $group: {
            _id: {
              sourceTokenId: '$sourceTokenId',
              destinationTokenId: '$destinationTokenId',
            },
            sourceTokenSymbol: { $first: '$sourceTokenSymbol' },
            destinationTokenSymbol: { $first: '$destinationTokenSymbol' },
            totalVolume: { $sum: '$sourceTokenAmountUsd' },
            totalTransactions: { $sum: 1 },
          },
        },
        {
          $addFields: {
            pairName: {
              $concat: ['$sourceTokenSymbol', ' → ', '$destinationTokenSymbol'],
            },
          },
        },
        { $sort: { totalVolume: -1 } },
        { $limit: 3 },
        {
          $project: {
            _id: 0,
            pairName: 1,
            sourceTokenId: '$_id.sourceTokenId',
            destinationTokenId: '$_id.destinationTokenId',
            sourceTokenSymbol: 1,
            destinationTokenSymbol: 1,
            totalVolume: 1,
            totalTransactions: 1,
          },
        },
      ]),

      // Swap pairs data by transactions (top 3 trading pairs by transaction count)
      Transaction.aggregate([
        {
          $match: {
            status: 'succeeded',
            isSwap: true,
          },
        },
        {
          $group: {
            _id: {
              sourceTokenId: '$sourceTokenId',
              destinationTokenId: '$destinationTokenId',
            },
            sourceTokenSymbol: { $first: '$sourceTokenSymbol' },
            destinationTokenSymbol: { $first: '$destinationTokenSymbol' },
            totalVolume: { $sum: '$sourceTokenAmountUsd' },
            totalTransactions: { $sum: 1 },
          },
        },
        {
          $addFields: {
            pairName: {
              $concat: ['$sourceTokenSymbol', ' → ', '$destinationTokenSymbol'],
            },
          },
        },
        { $sort: { totalTransactions: -1 } },
        { $limit: 3 },
        {
          $project: {
            _id: 0,
            pairName: 1,
            sourceTokenId: '$_id.sourceTokenId',
            destinationTokenId: '$_id.destinationTokenId',
            sourceTokenSymbol: 1,
            destinationTokenSymbol: 1,
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
      swapPairsByVolume,
      swapPairsByTransactions,
    }
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e))
    await captureServerError(error)
    throw error
  }
}
