import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const transactionData = await request.json()

    if (
      !process.env.ANALYTICS_DASHBOARD_AUTH_TOKEN ||
      !process.env.ANALYTICS_DASHBOARD_BASE_URL
    ) {
      return NextResponse.json({ error: 'Analytics configuration missing' }, { status: 500 })
    }

    const apiUrl = `${process.env.ANALYTICS_DASHBOARD_BASE_URL}/api/create-transaction`
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: process.env.ANALYTICS_DASHBOARD_AUTH_TOKEN,
      },
      body: JSON.stringify(transactionData),
    })

    if (!response.ok) {
      // Handle 409 conflict (duplicate transaction) as a non-error case
      if (response.status === 409) {
        return NextResponse.json({ success: true, info: 'Transaction already exists' })
      }

      const errorMessage = await getErrorMessage(response)
      const error = new Error(errorMessage)
      error.name = 'AnalyticsAPIError'
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `Failed to track analytics: ${errorMessage}` }, { status: 500 })
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