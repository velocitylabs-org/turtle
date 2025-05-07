import { NextResponse } from 'next/server'
import dbConnect from '@/utils/db-connect'
import Transaction from '@/models/Transaction'
import validateRequest from '@/utils/validate-request'

export async function GET(request: Request) {
  try {
    if (!validateRequest(request)) {
      return new Response(JSON.stringify({ message: 'Forbidden' }), {
        status: 403,
      })
    }

    await dbConnect()

    // Execute all queries in parallel for better performance
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
          'txDate sourceTokenId sourceTokenSymbol sourceTokenAmount sourceTokenAmountUsd sourceChainUid sourceChainName destinationTokenId destinationTokenSymbol destinationChainUid destinationChainName status',
        ),

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

    const summary = {
      totalVolumeUsd,
      totalTransactions,
      avgTransactionValue,
      successRate,
      recentTransactions,
      topTokens: topTokensResult,
      dailyVolume: dailyVolumeResult,
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
