import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { formatCampaignScheduleLabel, formatRelativeScheduleDay } from '@/utils/scheduleRelative'

describe('formatRelativeScheduleDay', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-27T10:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('labels same calendar day as hoje', () => {
    expect(formatRelativeScheduleDay('2026-10-27')).toBe('hoje')
  })

  it('labels next day as amanhã', () => {
    expect(formatRelativeScheduleDay('2026-10-28')).toBe('amanhã')
  })

  it('formats campaign schedule without mixing relative and absolute dates', () => {
    expect(formatCampaignScheduleLabel('2026-10-27', '14:00')).toBe('Hoje, 14:00')
    expect(formatCampaignScheduleLabel('2026-10-20', '09:30')).toMatch(/20\/10\/2026 às 09:30/)
  })
})

describe('exampleReportKpis alignment', () => {
  it('sums agent handled to 128', async () => {
    const { exampleReportKpis } = await import('@/mocks/reports')
    expect(exampleReportKpis.conversationsHandled).toBe(128)
  })
})
