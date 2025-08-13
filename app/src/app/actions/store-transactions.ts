'use server'

import { parseAnalyticsServerActionError } from '@/utils/parseAnalyticsActionError'

/**
 * Transaction data type is defined in utils/analytics.ts
 * Contains transfer metrics including token details, amounts, chains, and transaction status
 */

// biome-ignore lint/suspicious/noExplicitAny: any
export default async function storeAnalyticsTransaction(data: any) {
  try {
    if (!process.env.ANALYTICS_DASHBOARD_AUTH_TOKEN || !process.env.ANALYTICS_DASHBOARD_BASE_URL) {
      throw new Error('Analytics configuration missing')
    }

    const apiUrl = `${process.env.ANALYTICS_DASHBOARD_BASE_URL}/api/transaction`
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: process.env.ANALYTICS_DASHBOARD_AUTH_TOKEN,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      // Handle 409 conflict (duplicate transaction) as a non-error case
      if (response.status === 409) {
        return { success: true, info: 'Transaction already exists' }
      }

      const errorMessage = await parseAnalyticsServerActionError(response)
      const error = new Error(errorMessage)
      error.name = 'AnalyticsAPIError'
      throw error
    }

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Analytics unknown error'
    throw new Error(errorMessage)
  }
}
