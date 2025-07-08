import { NextResponse } from 'next/server'
import Transaction from '@/models/Transaction'
import captureServerError from '@/utils/capture-server-error'
import dbConnect from '@/utils/db-connect'
import { validateAppRequest } from '@/utils/validate-app-request'

function corsHeaders(response: NextResponse, origin?: string | null) {
  const allowedOrigins =
    process.env.TRANSACTION_ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || []

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }

  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

// Handle OPTIONS requests (preflight)
export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin')

  return corsHeaders(
    new NextResponse(null, {
      status: 204,
    }),
    origin,
  )
}

// This endpoint provides basic analytics data for the landing page
export async function GET(request: Request) {
  const origin = request.headers.get('origin')
  try {
    if (!validateAppRequest(request)) {
      await captureServerError(new Error('Forbidden 403'))
      return corsHeaders(NextResponse.json({ message: 'Forbidden' }, { status: 403 }))
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

    return corsHeaders(
      NextResponse.json({
        totalVolumeUsd,
        totalTransactions,
      }),
      origin,
    )
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e))
    await captureServerError(error)
    return corsHeaders(
      NextResponse.json(
        {
          error: 'Internal Server Error',
          message: error.message,
        },
        { status: 500 },
      ),
      origin,
    )
  }
}
