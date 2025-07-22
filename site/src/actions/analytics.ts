'use server'
import fetchAnalyticsData from '@/utils/fetchAnalyticsData'

export default async function getAnalyticsData() {
  return await fetchAnalyticsData()
}
