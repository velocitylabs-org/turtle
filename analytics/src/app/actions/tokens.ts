'use server'
import Transaction from '@/models/Transaction'
import captureServerError from '@/utils/capture-server-error'
import dbConnect from '@/utils/db-connect'

export async function getTokensData() {
  try {
    await dbConnect()

    const tokensData = await Transaction.aggregate([
      {
        $match: {
          status: 'succeeded',
        },
      },
      {
        $group: {
          _id: '$sourceTokenId',
          tokenId: { $first: '$sourceTokenId' },
          totalVolume: { $sum: '$sourceTokenAmountUsd' },
          totalTransactions: { $sum: 1 },
        },
      },
      { $sort: { totalVolume: -1 } },
      {
        $project: {
          _id: 0,
          tokenId: 1,
          totalVolume: 1,
          totalTransactions: 1,
        },
      },
    ])

    return {
      tokens: tokensData,
    }
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e))
    await captureServerError(error)
    throw error
  }
}
