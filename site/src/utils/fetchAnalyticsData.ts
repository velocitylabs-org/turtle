interface AnalyticsData {
  totalVolumeUsd: number
  totalTransactions: number
}

export default async function fetchAnalyticsData(): Promise<AnalyticsData | null> {
  try {
    const apiUrl = `${process.env.ANALYTICS_DASHBOARD_BASE_URL}/api/simple-summary`
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: process.env.AUTH_TOKEN || '',
      },
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      console.log('Failed to fetch analytics data:', response.status)
      return null
    }

    return await response.json()
  } catch (error) {
    console.log('Error fetching analytics data:', error)
    return null
  }
}
