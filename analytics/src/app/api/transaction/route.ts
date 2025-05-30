import { NextResponse } from 'next/server'
import Transaction from '@/models/Transaction'
import captureServerError from '@/utils/capture-server-error'
import dbConnect from '@/utils/db-connect'
import validateRequest from '@/utils/validate-request'

function corsHeaders(response: NextResponse, origin?: string | null) {
  const allowedOrigins =
    process.env.TRANSACTION_ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || []

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
    origin,
  )
}

// Create a new transaction
export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  const data = await request.json()
  try {
    if (!validateRequest(request)) {
      await captureServerError(new Error('Forbidden 403'))
      return corsHeaders(NextResponse.json({ message: 'Forbidden' }, { status: 403 }))
    }

    await dbConnect()
    const existingTransaction = await Transaction.findOne({ txHashId: data.txHashId })
    if (existingTransaction) {
      return corsHeaders(
        NextResponse.json(
          { error: 'A transaction with this hash ID already exists' },
          { status: 409 },
        ),
        origin,
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
      origin,
    )
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e))
    await captureServerError(error, data)
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

// Update transaction status
export async function PATCH(request: Request) {
  const origin = request.headers.get('origin')
  const data = await request.json()
  try {
    if (!validateRequest(request)) {
      await captureServerError(new Error('Forbidden 403'))
      return corsHeaders(NextResponse.json({ message: 'Forbidden' }, { status: 403 }))
    }

    const { txHashId, status } = data
    if (!txHashId || !status) {
      return corsHeaders(
        NextResponse.json({ error: 'txHashId and status are required' }, { status: 400 }),
        origin,
      )
    }

    await dbConnect()
    const updatedTransaction = await Transaction.findOneAndUpdate(
      { txHashId },
      { status },
      { new: true, runValidators: true },
    )

    if (!updatedTransaction) {
      return corsHeaders(
        NextResponse.json({ error: 'Transaction not found' }, { status: 404 }),
        origin,
      )
    }

    return corsHeaders(
      NextResponse.json(
        {
          message: 'Transaction status updated successfully',
        },
        { status: 200 },
      ),
      origin,
    )
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e))
    await captureServerError(error, data)
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
