'use server'
import Transaction from '@/models/Transaction'
import captureServerError from '@/utils/capture-server-error'
import dbConnect from '@/utils/db-connect'

export async function getChainsData(chainUid: string) {
  try {
    await dbConnect()

    const [byTransactionCount, byVolume] = await Promise.all([
      // Aggregation for transaction count
      Transaction.aggregate([
        {
          $match: {
            status: 'succeeded',
            sourceChainUid: chainUid,
          },
        },
        {
          $group: {
            _id: '$destinationChainUid',
            from: { $first: chainUid },
            to: { $first: '$destinationChainUid' },
            size: { $sum: 1 }, // Count of transactions
          },
        },
        { $sort: { size: -1 } },
        {
          $project: {
            _id: 0,
            from: 1,
            to: 1,
            size: 1,
          },
        },
      ]),

      // Aggregation for volume in USD
      Transaction.aggregate([
        {
          $match: {
            status: 'succeeded',
            sourceChainUid: chainUid,
          },
        },
        {
          $group: {
            _id: '$destinationChainUid',
            from: { $first: chainUid },
            to: { $first: '$destinationChainUid' },
            size: { $sum: '$sourceTokenAmountUsd' }, // Sum of USD volume
          },
        },
        { $sort: { size: -1 } },
        {
          $project: {
            _id: 0,
            from: 1,
            to: 1,
            size: 1,
          },
        },
      ]),
    ])

    return {
      selectedChain: chainUid,
      byTransactionCount,
      byVolume,
    }
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e))
    await captureServerError(error)
    throw error
  }
}
