'use server'
import { startOfMonth, subMonths, format, addDays, startOfDay, subDays } from 'date-fns'
import { defaultTransactionLimit, volumePeakThreshold } from '@/constants'
import Transaction from '@/models/Transaction'
import transactionView from '@/models/transaction-view'
import captureServerError from '@/utils/capture-server-error'
import dbConnect from '@/utils/db-connect'

export async function getSummaryData() {
  try {
    await dbConnect()

    const [
      volumeResult,
      totalTransactions,
      successfulTransactions,
      recentTransactions,
      topTokensByVolume,
      topTokensByCount,
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

      // Retrieve the latest transactions, limiting results to defaultTransactionLimit
      Transaction.find()
        .sort({ txDate: -1 })
        .limit(defaultTransactionLimit)
        .select(
          [
            '_id',
            Transaction.schema.paths.txDate.path,
            Transaction.schema.paths.sourceTokenId.path,
            Transaction.schema.paths.sourceTokenSymbol.path,
            Transaction.schema.paths.sourceTokenAmount.path,
            Transaction.schema.paths.sourceTokenAmountUsd.path,
            Transaction.schema.paths.sourceChainUid.path,
            Transaction.schema.paths.sourceChainName.path,
            Transaction.schema.paths.destinationTokenId.path,
            Transaction.schema.paths.destinationTokenSymbol.path,
            Transaction.schema.paths.destinationChainUid.path,
            Transaction.schema.paths.destinationChainName.path,
            Transaction.schema.paths.status.path,
          ].join(' '),
        )
        .lean(),

      // Top 3 tokens by volume
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
            volume: { $sum: '$sourceTokenAmountUsd' },
          },
        },
        { $sort: { volume: -1 } },
        { $limit: 3 },
        {
          $project: {
            _id: 0,
            id: '$_id',
            symbol: 1,
            name: 1,
            volume: 1,
          },
        },
      ]),

      // Top 3 tokens by transaction count
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
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 3 },
        {
          $project: {
            _id: 0,
            id: '$_id',
            symbol: 1,
            name: 1,
            count: 1,
          },
        },
      ]),
    ])

    // Get transaction data for all time periods
    const transactionData = await getAllTransactionData()

    // Get top tokens data (normal and flattened)
    const topTokensData = await getAllTopTokensData()

    const totalVolumeUsd = volumeResult[0]?.total || 0
    const successRate =
      totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0
    const avgTransactionValue =
      successfulTransactions > 0 ? totalVolumeUsd / successfulTransactions : 0

    // Apply the schema to each transaction
    const serializedRecentTransactions = recentTransactions.map(transaction =>
      transactionView.parse(transaction),
    )

    return {
      totalVolumeUsd,
      totalTransactions,
      avgTransactionValue,
      successRate,
      recentTransactions: serializedRecentTransactions,
      topTokensByVolume,
      topTokensByCount,
      topTokensData,
      transactionData,
    }
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e))
    await captureServerError(error)
    throw error
  }
}

// Function to get transaction data for all time periods
async function getAllTransactionData() {
  const now = new Date()
  const sixMonthsAgo = subMonths(now, 6)
  const currentMonthStart = startOfMonth(now)
  const lastMonthStart = startOfMonth(subMonths(now, 1))
  const sevenDaysAgo = subDays(startOfDay(now), 7)
  const todayStart = startOfDay(now)

  // Get all data using a single facet aggregation
  const aggregationResult = await Transaction.aggregate([
    {
      $match: {
        txDate: {
          $gte: sixMonthsAgo,
        },
        status: 'succeeded',
      },
    },
    {
      $facet: {
        // Six-month data grouped by month (excluding current month)
        sixMonthsData: [
          {
            $match: {
              txDate: {
                $lt: currentMonthStart,
              },
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
              timestamp: '$_id',
              volumeUsd: 1,
              count: 1,
            },
          },
        ],

        // Last month data grouped by day (excluding current day)
        lastMonthData: [
          {
            $match: {
              txDate: {
                $gte: lastMonthStart,
                $lt: todayStart,
              },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: '%Y-%m-%d',
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
              timestamp: '$_id',
              volumeUsd: 1,
              count: 1,
            },
          },
        ],

        // Last 7 days data grouped by day (excluding current day)
        lastWeekData: [
          {
            $match: {
              txDate: {
                $gte: sevenDaysAgo,
                $lt: todayStart,
              },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: '%Y-%m-%d',
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
              timestamp: '$_id',
              volumeUsd: 1,
              count: 1,
            },
          },
        ],

        // Flattened six-month data (filtering out transactions > 50000)
        flattenedSixMonthsData: [
          {
            $match: {
              txDate: {
                $lt: currentMonthStart,
              },
              sourceTokenAmountUsd: { $lte: volumePeakThreshold },
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
              timestamp: '$_id',
              volumeUsd: 1,
              count: 1,
            },
          },
        ],

        // Flattened last month data (filtering out transactions > 50000)
        flattenedLastMonthData: [
          {
            $match: {
              txDate: {
                $gte: lastMonthStart,
                $lt: todayStart,
              },
              sourceTokenAmountUsd: { $lte: volumePeakThreshold },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: '%Y-%m-%d',
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
              timestamp: '$_id',
              volumeUsd: 1,
              count: 1,
            },
          },
        ],

        // Flattened last 7 days data (filtering out transactions > 50000)
        flattenedLastWeekData: [
          {
            $match: {
              txDate: {
                $gte: sevenDaysAgo,
                $lt: todayStart,
              },
              sourceTokenAmountUsd: { $lte: volumePeakThreshold },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: '%Y-%m-%d',
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
              timestamp: '$_id',
              volumeUsd: 1,
              count: 1,
            },
          },
        ],
      },
    },
  ])

  const result = aggregationResult[0]

  // Ensure all 7 previous days are included (excluding today) for both normal and flattened
  const completeNormalLastWeekData = fillMissingDays(result.lastWeekData, sevenDaysAgo, todayStart)
  const completeFlattenedLastWeekData = fillMissingDays(
    result.flattenedLastWeekData,
    sevenDaysAgo,
    todayStart,
  )

  return {
    normal: {
      sixMonthsData: result.sixMonthsData,
      lastMonthData: result.lastMonthData,
      lastWeekData: completeNormalLastWeekData,
    },
    flattened: {
      sixMonthsData: result.flattenedSixMonthsData,
      lastMonthData: result.flattenedLastMonthData,
      lastWeekData: completeFlattenedLastWeekData,
    },
  }
}

// Helper function to fill in missing days in a date range
function fillMissingDays(
  data: { timestamp: string; volumeUsd: number; count: number }[],
  startDate: Date,
  endDate: Date,
) {
  const allDays = []
  let currentDate = new Date(startDate)
  while (currentDate < endDate) {
    allDays.push({
      date: new Date(currentDate),
      formattedDate: format(currentDate, 'yyyy-MM-dd'),
    })
    currentDate = addDays(currentDate, 1)
  }

  return allDays.map(day => {
    const existingData = data.find(item => item.timestamp === day.formattedDate)

    // If data exists for this day, use it, otherwise, use zero values
    return (
      existingData || {
        timestamp: day.formattedDate,
        volumeUsd: 0,
        count: 0,
      }
    )
  })
}

// Function to get top tokens data (normal and flattened)
async function getAllTopTokensData() {
  const aggregationResult = await Transaction.aggregate([
    {
      $match: {
        status: 'succeeded',
      },
    },
    {
      $facet: {
        // Normal top tokens by volume
        topTokensByVolume: [
          {
            $group: {
              _id: '$sourceTokenId',
              symbol: { $first: '$sourceTokenSymbol' },
              name: { $first: '$sourceTokenName' },
              volume: { $sum: '$sourceTokenAmountUsd' },
            },
          },
          { $sort: { volume: -1 } },
          { $limit: 3 },
          {
            $project: {
              _id: 0,
              id: '$_id',
              symbol: 1,
              name: 1,
              volume: 1,
            },
          },
        ],

        // Normal top tokens by count
        topTokensByCount: [
          {
            $group: {
              _id: '$sourceTokenId',
              symbol: { $first: '$sourceTokenSymbol' },
              name: { $first: '$sourceTokenName' },
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 3 },
          {
            $project: {
              _id: 0,
              id: '$_id',
              symbol: 1,
              name: 1,
              count: 1,
            },
          },
        ],

        // Flattened top tokens by volume (filtering out transactions > threshold)
        flattenedTopTokensByVolume: [
          {
            $match: {
              sourceTokenAmountUsd: { $lte: volumePeakThreshold },
            },
          },
          {
            $group: {
              _id: '$sourceTokenId',
              symbol: { $first: '$sourceTokenSymbol' },
              name: { $first: '$sourceTokenName' },
              volume: { $sum: '$sourceTokenAmountUsd' },
            },
          },
          { $sort: { volume: -1 } },
          { $limit: 3 },
          {
            $project: {
              _id: 0,
              id: '$_id',
              symbol: 1,
              name: 1,
              volume: 1,
            },
          },
        ],

        // Flattened top tokens by count (filtering out transactions > threshold)
        flattenedTopTokensByCount: [
          {
            $match: {
              sourceTokenAmountUsd: { $lte: volumePeakThreshold },
            },
          },
          {
            $group: {
              _id: '$sourceTokenId',
              symbol: { $first: '$sourceTokenSymbol' },
              name: { $first: '$sourceTokenName' },
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 3 },
          {
            $project: {
              _id: 0,
              id: '$_id',
              symbol: 1,
              name: 1,
              count: 1,
            },
          },
        ],
      },
    },
  ])

  const result = aggregationResult[0]

  return {
    normal: {
      topTokensByVolume: result.topTokensByVolume,
      topTokensByCount: result.topTokensByCount,
    },
    flattened: {
      topTokensByVolume: result.flattenedTopTokensByVolume,
      topTokensByCount: result.flattenedTopTokensByCount,
    },
  }
}
