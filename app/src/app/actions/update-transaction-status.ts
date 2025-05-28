'use server'

import { TxStatus } from '@/models/transfer'

interface UpdateAnalyticsTxStatusParams {
  txHashId: string
  status: TxStatus
}

export default async function updateAnalyticsTxStatus({ txHashId, status } : UpdateAnalyticsTxStatusParams) {
  try {
    if (!process.env.ANALYTICS_DASHBOARD_AUTH_TOKEN || !process.env.ANALYTICS_DASHBOARD_BASE_URL) {
      throw new Error('Analytics configuration missing')
    }

    if (!txHashId || !status) {
      throw new Error('txHashId and status are required')
    }

    const apiUrl = `${process.env.ANALYTICS_DASHBOARD_BASE_URL}/api/update-transaction-status`
    const response = await fetch(apiUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: process.env.ANALYTICS_DASHBOARD_AUTH_TOKEN,
      },
      body: JSON.stringify({ txHashId, status }),
    })

    if (!response.ok) {
      const errorMessage = await getErrorMessage(response)
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

async function getErrorMessage(response: Response) {
  let errorMessage = `Analytics API error: ${response.status}`
  const responseText = await response.text()
  if (responseText) {
    try {
      const errorData = JSON.parse(responseText)
      return errorData.error || `${errorMessage} - ${responseText}`
    } catch {
      errorMessage += ` - ${responseText}`
    }
  }
  return errorMessage
}
