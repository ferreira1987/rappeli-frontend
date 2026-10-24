import type { DashboardMessageVolume, DashboardMetrics } from '@/types/dashboard'

export class DashboardParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DashboardParseError'
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

function readNonNegativeInt(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return null
  }
  return Math.floor(value)
}

function unwrapResourceData(payload: unknown): unknown {
  if (!isRecord(payload)) {
    return payload
  }
  if ('data' in payload) {
    return payload.data
  }
  return payload
}

function parseMessageVolume(raw: unknown): DashboardMessageVolume | null {
  if (!isRecord(raw)) {
    return null
  }

  const pointsRaw = raw.points
  if (!Array.isArray(pointsRaw)) {
    return null
  }

  const points = pointsRaw
    .map((point) => {
      if (!isRecord(point) || typeof point.date !== 'string') {
        return null
      }
      const outbound = readNonNegativeInt(point.outbound)
      const inbound = readNonNegativeInt(point.inbound)
      if (outbound === null || inbound === null) {
        return null
      }
      return { date: point.date, outbound, inbound }
    })
    .filter((point): point is DashboardMessageVolume['points'][number] => point != null)

  const periodDays = readNonNegativeInt(raw.period_days) ?? 7

  if (points.length === 0) {
    return null
  }

  return { period_days: periodDays, points }
}

export function parseDashboardMetricsPayload(payload: unknown): DashboardMetrics {
  const unwrapped = unwrapResourceData(payload)

  if (!isRecord(unwrapped)) {
    throw new DashboardParseError(
      'Resposta inválida de /api/dashboard/metrics: objeto JSON esperado.',
    )
  }

  return {
    conversations_today: readNonNegativeInt(unwrapped.conversations_today),
    automated_messages_count: readNonNegativeInt(unwrapped.automated_messages_count),
    automated_messages_period_days: readNonNegativeInt(unwrapped.automated_messages_period_days),
    average_response_time_seconds: readNonNegativeInt(unwrapped.average_response_time_seconds),
    new_contacts_today: readNonNegativeInt(unwrapped.new_contacts_today),
    message_volume: parseMessageVolume(unwrapped.message_volume),
  }
}
