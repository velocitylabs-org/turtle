import { NextResponse } from 'next/server'
import dbConnect from '@/utils/db-connect'
import Transaction from '@/models/Transaction'
import validateRequest from '@/utils/validate-request'
import captureServerError from '@/utils/capture-server-error'

export async function GET(request: Request) {
  try {
    if (!validateRequest(request)) {
      return new Response(JSON.stringify({ message: 'Forbidden' }), {
        status: 403,
      })
    }

    await dbConnect()
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const sourceChainUid = searchParams.get('sourceChainUid')
    const destinationChainUid = searchParams.get('destinationChainUid')
    const sourceTokenId = searchParams.get('sourceTokenId')
    const destinationTokenId = searchParams.get('destinationTokenId')
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    interface MongoQuery {
      sourceChainUid?: { $regex: RegExp }
      destinationChainUid?: { $regex: RegExp }
      sourceTokenId?: { $regex: RegExp }
      destinationTokenId?: { $regex: RegExp }
      status?: 'succeeded' | 'failed' | 'undefined'
      txDate?: {
        $gte?: Date
        $lte?: Date
      }
    }

    const query: MongoQuery = {}

    if (sourceChainUid) {
      query.sourceChainUid = { $regex: new RegExp(sourceChainUid, 'i') }
    }

    if (destinationChainUid) {
      query.destinationChainUid = { $regex: new RegExp(destinationChainUid, 'i') }
    }

    if (sourceTokenId) {
      query.sourceTokenId = { $regex: new RegExp(sourceTokenId, 'i') }
    }

    if (destinationTokenId) {
      query.destinationTokenId = { $regex: new RegExp(destinationTokenId, 'i') }
    }

    type ValidStatus = 'succeeded' | 'failed' | 'undefined'
    if (status) {
      const validStatus = status as ValidStatus
      if (['succeeded', 'failed', 'undefined'].includes(validStatus)) {
        query.status = validStatus
      }
    }

    if (startDate || endDate) {
      query.txDate = {}
      if (startDate) {
        query.txDate.$gte = new Date(startDate)
      }
      if (endDate) {
        query.txDate.$lte = new Date(endDate)
      }
    }

    const [filteredTransactions, totalVolumeUsd, statusCounts] = await Promise.all([
      // Get latest 5 transactions
      Transaction.find(query)
        .sort({ txDate: -1 })
        .limit(5)
        .select(
          'txDate sourceTokenId sourceTokenSymbol sourceTokenAmount sourceTokenAmountUsd sourceChainUid sourceChainName destinationTokenId destinationTokenSymbol destinationChainUid destinationChainName status',
        ),

      // Calculate total volume
      Transaction.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$sourceTokenAmountUsd' } } },
      ]),

      // Get status counts
      Transaction.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
    ])

    interface StatusMap {
      succeeded: number
      failed: number
      undefined: number
      [key: string]: number
    }

    interface StatusCount {
      _id: string
      count: number
    }

    // Process status counts
    const statusMap = statusCounts.reduce<StatusMap>(
      (acc, curr: StatusCount) => {
        acc[curr._id] = curr.count
        return acc
      },
      {
        succeeded: 0,
        failed: 0,
        undefined: 0,
      },
    )

    return NextResponse.json({
      transactions: filteredTransactions,
      summary: {
        totalVolumeUsd: totalVolumeUsd[0]?.total || 0,
        totalTransactions: Object.values(statusMap).reduce((a: number, b: number) => a + b, 0),
        succeededCount: statusMap.succeeded,
        failedCount: statusMap.failed,
        undefinedCount: statusMap.undefined,
      },
    })
  } catch (error) {
    captureServerError(error as Error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
