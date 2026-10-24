import { http } from '@/api/http'
import { parseDashboardMetricsPayload } from '@/api/dashboardParsing'
import type { DashboardMetrics } from '@/types/dashboard'
import { isAxiosError } from 'axios'

export async function fetchDashboardMetrics(): Promise<DashboardMetrics | null> {
  try {
    const { data } = await http.get<unknown>('/api/dashboard/metrics')
    return parseDashboardMetricsPayload(data)
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return null
    }
    throw error
  }
}
