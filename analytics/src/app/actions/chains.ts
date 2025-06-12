'use server'
import Transaction from '@/models/Transaction'
import captureServerError from '@/utils/capture-server-error'
import dbConnect from '@/utils/db-connect'

export async function getChainSankeyData(chainUid: string) {
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
      ]),

      // Aggregation for total volume
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
            size: { $sum: '$sourceTokenAmountUsd' },
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

export async function getChainsData() {
  try {
    await dbConnect()
    const results = await Transaction.aggregate([
      {
        $match: { status: 'succeeded' },
      },
      // Outgoing data
      {
        $group: {
          _id: '$sourceChainUid',
          chainUid: { $first: '$sourceChainUid' },
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
            { $match: { status: 'succeeded' } },
            {
              $group: {
                _id: '$destinationChainUid',
                chainUid: { $first: '$destinationChainUid' },
                incomingVolume: { $sum: '$sourceTokenAmountUsd' },
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
          _id: '$chainUid',
          chainUid: { $first: '$chainUid' },
          incomingVolume: { $sum: '$incomingVolume' },
          incomingTransactions: { $sum: '$incomingTransactions' },
          outgoingVolume: { $sum: '$outgoingVolume' },
          outgoingTransactions: { $sum: '$outgoingTransactions' },
        },
      },
      {
        $project: {
          _id: 0,
          chainUid: 1,
          incomingVolume: 1,
          incomingTransactions: 1,
          outgoingVolume: 1,
          outgoingTransactions: 1,
        },
      },
    ])

    return {
      chains: results,
    }
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e))
    await captureServerError(error)
    throw error
  }
}
