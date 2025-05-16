import { NextResponse } from 'next/server'
import dbConnect from '@/utils/db-connect'
import Transaction from '@/models/Transaction'
import validateRequest from '@/utils/validate-request'

// This endpoint provides basic analytics data for the landing page
export async function GET(request: Request) {
  try {
    if (!validateRequest(request)) {
      return new Response(JSON.stringify({ message: 'Forbidden' }), {
        status: 403,
      })
    }

    await dbConnect()

    const [volumeResult, totalTransactions] = await Promise.all([
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

      // Total number of succeeded transactions
      Transaction.countDocuments({ status: 'succeeded' }),
    ])

    const totalVolumeUsd = volumeResult[0]?.total || 0

    return NextResponse.json({
      totalVolumeUsd,
      totalTransactions,
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
