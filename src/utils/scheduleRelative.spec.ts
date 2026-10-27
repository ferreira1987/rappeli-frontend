import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { formatRelativeScheduleDay } from '@/utils/scheduleRelative'

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
})
