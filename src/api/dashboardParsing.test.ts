import { describe, expect, it } from 'vitest'

import { DashboardParseError, parseDashboardMetricsPayload } from '@/api/dashboardParsing'

describe('parseDashboardMetricsPayload', () => {
  it('parses metrics and message volume series', () => {
    const result = parseDashboardMetricsPayload({
      data: {
        conversations_today: 12,
        automated_messages_count: 340,
        automated_messages_period_days: 7,
        average_response_time_seconds: 84,
        new_contacts_today: 3,
        message_volume: {
          period_days: 7,
          points: [
            { date: '2026-10-20', outbound: 10, inbound: 4 },
            { date: '2026-10-21', outbound: 0, inbound: 2 },
          ],
        },
      },
    })

    expect(result.conversations_today).toBe(12)
    expect(result.automated_messages_count).toBe(340)
    expect(result.message_volume?.points).toHaveLength(2)
  })

  it('allows null metric fields', () => {
    const result = parseDashboardMetricsPayload({
      conversations_today: null,
      automated_messages_count: null,
      automated_messages_period_days: null,
      average_response_time_seconds: null,
      new_contacts_today: null,
      message_volume: null,
    })

    expect(result.conversations_today).toBeNull()
    expect(result.message_volume).toBeNull()
  })

  it('throws on invalid payload', () => {
    expect(() => parseDashboardMetricsPayload(null)).toThrow(DashboardParseError)
  })
})
