'use server'
import getAnalyticsData from '@/utils/getAnalyticsData'

export async function getAnalyticsAction() {
  return await getAnalyticsData()
}
