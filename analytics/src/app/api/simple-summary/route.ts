import { NextResponse } from 'next/server'
import Transaction from '@/models/Transaction'
import captureServerError from '@/utils/capture-server-error'
import dbConnect from '@/utils/db-connect'
import { validateApiRequest } from '@/utils/validate-api-request'

// This endpoint provides basic analytics data for the landing page
export async function GET(request: Request) {
  try {
    if (!validateApiRequest(request)) {
      await captureServerError(new Error('Forbidden 403'))
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
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
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e))
    await captureServerError(error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error.message,
      },
      { status: 500 },
    )
  }
}
