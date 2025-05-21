import { NextResponse } from 'next/server'
import dbConnect from '@/utils/db-connect'
import Transaction from '@/models/Transaction'
import validateRequest from '@/utils/validate-request'
import captureServerError from '@/utils/capture-server-error'

function corsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

// Handle OPTIONS requests (preflight)
export async function OPTIONS() {
  return corsHeaders(
    new NextResponse(null, {
      status: 204,
    }),
  )
}

export async function POST(request: Request) {
  try {
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
    )
  } catch (e) {
    const error = e as Error
    captureServerError(error as Error)
    return corsHeaders(
      NextResponse.json({ error: `Internal Server Error ${error.message}` }, { status: 500 }),
    )
  }
}
