import { http } from '@/api/http'
import { unwrapData } from '@/api/resource'
import type { ReportPayload, ReportPeriod } from '@/types/reports'

export async function fetchReport(period: ReportPeriod = '7d'): Promise<ReportPayload> {
  const { data } = await http.get<unknown>('/api/reports', { params: { period } })
  return unwrapData<ReportPayload>(data)
}

export async function downloadReportExport(period: ReportPeriod = '7d'): Promise<Blob> {
  const { data } = await http.get<Blob>('/api/reports/export', {
    params: { period },
    responseType: 'blob',
  })
  return data
}
