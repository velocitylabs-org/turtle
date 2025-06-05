'use server'
import Transaction from '@/models/Transaction'
import captureServerError from '@/utils/capture-server-error'
import dbConnect from '@/utils/db-connect'

export async function getChainsData(chainUid: string) {
  try {
    await dbConnect()
    const chainsData = await Transaction.aggregate([
      {
        $match: {
          status: 'succeeded',
          sourceChainUid: chainUid,
        },
      },
      {
        $group: {
          _id: '$destinationChainUid',
          from: { $first: chainUid }, // Always the provided chainUid
          to: { $first: '$destinationChainUid' }, // The destination chain
          size: { $sum: 1 },
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
    ])

    return {
      selectedChain: chainUid,
      chainsData,
    }
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e))
    await captureServerError(error)
    throw error
  }
}
