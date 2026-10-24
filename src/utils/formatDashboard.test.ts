import { describe, expect, it } from 'vitest'

import { formatAverageResponseTime, formatDashboardCount } from '@/utils/formatDashboard'

describe('formatDashboard', () => {
  it('formats counts and missing values', () => {
    expect(formatDashboardCount(1200)).toBe('1.200')
    expect(formatDashboardCount(null)).toBe('—')
  })

  it('formats average response time', () => {
    expect(formatAverageResponseTime(45)).toBe('45s')
    expect(formatAverageResponseTime(84)).toBe('1m 24s')
    expect(formatAverageResponseTime(null)).toBe('—')
  })
})
