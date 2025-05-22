import { NextResponse } from 'next/server'
import Transaction from '@/models/Transaction'
import captureServerError from '@/utils/capture-server-error'
import dbConnect from '@/utils/db-connect'
import validateRequest from '@/utils/validate-request'

function corsHeaders(response: NextResponse, origin?: string | null) {
  const allowedOrigins = process.env.TRANSACTION_ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || []

  // Check if the origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }

  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
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
    origin
  )
}

export async function POST(request: Request) {
  try {
    const origin = request.headers.get('origin')
    if (!validateRequest(request)) {
      return corsHeaders(NextResponse.json({ message: 'Forbidden' }, { status: 403 }))
    }

    await dbConnect()
    const data = await request.json()

    // Check if a transaction with the same txHashId already exists
    const existingTransaction = await Transaction.findOne({ txHashId: data.txHashId })
    if (existingTransaction) {
      return corsHeaders(
        NextResponse.json(
          { error: 'A transaction with this hash ID already exists' },
          { status: 409 },
        ),
        origin
      )
    }

    const transaction = new Transaction(data)
    await transaction.save()

    return corsHeaders(
      NextResponse.json(
        {
          message: 'Transaction stored successfully',
        },
        { status: 201 },
      ),
      origin
    )
  } catch (e) {
    const error = e as Error
    captureServerError(error as Error)
    return corsHeaders(
      NextResponse.json({ error: `Internal Server Error ${error.message}` }, { status: 500 }),
      origin
    )
  }
}
