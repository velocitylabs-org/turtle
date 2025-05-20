import { NextResponse } from 'next/server'
import dbConnect from '@/utils/db-connect'
import Transaction from '@/models/Transaction'
import validateRequest from '@/utils/validate-request'
import createTransaction from '@/models/create-transaction'
import captureServerError from '@/utils/capture-server-error'

export async function POST(request: Request) {
  try {
    if (!validateRequest(request)) {
      return new Response(JSON.stringify({ message: 'Forbidden' }), {
        status: 403,
      })
    }

    await dbConnect()
    const rawData = await request.json()

    const result = createTransaction.safeParse(rawData)
    if (!result.success) {
      // Return validation errors
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: result.error.format() 
        },
        { status: 400 },
      )
    }
    
    const data = result.data

    // Check if a transaction with the same txHashId already exists
    const existingTransaction = await Transaction.findOne({ txHashId: data.txHashId })
    if (existingTransaction) {
      return NextResponse.json(
        { error: 'A transaction with this hash ID already exists' },
        { status: 409 }, // 409 Conflict status code
      )
    }

    const transaction = new Transaction(data)
    await transaction.save()

    return NextResponse.json(
      {
        message: 'Transaction stored successfully',
        transaction,
      },
      { status: 201 },
    )
  } catch (error) {
    captureServerError(error as Error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
