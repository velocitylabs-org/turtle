'use server'
import { startOfWeek, startOfMonth, subMonths, format, addDays, startOfDay } from 'date-fns'
import { defaultTransactionLimit } from '@/constants'
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
  const thisWeekStart = startOfWeek(now)
  const todayStart = startOfDay(now)

  // Get all data in a single aggregation
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

        // This week data grouped by day (excluding current day)
        thisWeekData: [
          {
            $match: {
              txDate: {
                $gte: thisWeekStart,
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
      },
    },
  ])

  const { sixMonthsData, lastMonthData, thisWeekData: rawThisWeekData } = aggregationResult[0]

  // Ensure all days of the week are included for weekly data (excluding today)
  const completeThisWeekData = fillMissingDaysInWeek(rawThisWeekData, thisWeekStart, todayStart)

  return {
    sixMonthsData,
    lastMonthData,
    thisWeekData: completeThisWeekData,
  }
}

// Helper function to fill in missing days in a week
function fillMissingDaysInWeek(
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
