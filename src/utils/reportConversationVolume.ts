import type { ReportConversationVolume, ReportConversationVolumePoint } from '@/types/reports'

export type NormalizedConversationVolumePoint = {
  date: string
  handled: number
  resolved: number
}

export function normalizeConversationVolumePoint(
  point: ReportConversationVolumePoint,
): NormalizedConversationVolumePoint | null {
  const date = point.date?.trim()
  if (!date) {
    return null
  }
  const handled =
    point.conversations_handled ??
    point.handled ??
    point.conversations_started ??
    0
  const resolved = point.conversations_resolved ?? point.resolved ?? 0
  return {
    date,
    handled: Number.isFinite(handled) ? handled : 0,
    resolved: Number.isFinite(resolved) ? resolved : 0,
  }
}

export function normalizeConversationVolume(
  volume: ReportConversationVolume | null | undefined,
): NormalizedConversationVolumePoint[] {
  const points = volume?.points ?? []
  return points
    .map(normalizeConversationVolumePoint)
    .filter((point): point is NormalizedConversationVolumePoint => point != null)
}

export function findPeakVolumeDay(
  points: NormalizedConversationVolumePoint[],
): { date: string; handled: number } | null {
  if (!points.length) {
    return null
  }
  let peak = points[0]!
  for (const point of points) {
    if (point.handled > peak.handled) {
      peak = point
    }
  }
  return { date: peak.date, handled: peak.handled }
}
