'use server'

interface AnalyticsData {
  totalVolumeUsd: number
  totalTransactions: number
}

export default async function getAnalyticsData(): Promise<AnalyticsData | null> {
  try {
    const apiUrl = `${process.env.ANALYTICS_DASHBOARD_BASE_URL}/api/simple-summary`
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: process.env.AUTH_TOKEN || '',
      },
    })

    if (!response.ok) {
      console.error('Failed to fetch analytics data:', response.status)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching analytics data:', error)
    return null
  }
}
