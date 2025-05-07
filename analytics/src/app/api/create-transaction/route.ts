import { NextResponse } from 'next/server'
import dbConnect from '@/utils/db-connect'
import Transaction from '@/models/Transaction'
import validateRequest from '@/utils/validate-request'

export async function POST(request: Request) {
  try {
    if (!validateRequest(request)) {
      return new Response(JSON.stringify({ message: 'Forbidden' }), {
        status: 403,
      })
    }

    await dbConnect()
    const data = await request.json()

    // Validate required fields
    const requiredFields = [
      'txHashId',
      'sourceTokenId',
      'sourceTokenName',
      'sourceTokenSymbol',
      'sourceTokenAmount',
      'sourceTokenAmountUsd',
      'destinationTokenId',
      'destinationTokenName',
      'destinationTokenSymbol',
      'feesTokenId',
      'feesTokenName',
      'feesTokenSymbol',
      'feesTokenAmount',
      'feesTokenAmountUsd',
      'senderAddress',
      'recipientAddress',
      'sourceChainUid',
      'sourceChainId',
      'sourceChainName',
      'sourceChainNetwork',
      'destinationChainUid',
      'destinationChainId',
      'destinationChainName',
      'destinationChainNetwork',
      'txDate',
      'hostedOn',
    ]

    const missingFields = requiredFields.filter(field => !data[field])
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 },
      )
    }

    // Check if a transaction with the same txHashId already exists
    const existingTransaction = await Transaction.findOne({ txHashId: data.txHashId })
    if (existingTransaction) {
      return NextResponse.json(
        { error: 'A transaction with this hash ID already exists' },
        { status: 409 }, // 409 Conflict status code
      )
    }

    // Create a new transaction
    const transaction = new Transaction(data)
    await transaction.save()

    return NextResponse.json(
      {
        message: 'Transaction created successfully',
        transaction,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
