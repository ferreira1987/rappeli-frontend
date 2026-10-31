import { describe, expect, it } from 'vitest'

import { buildReportStatusSegments, resolutionEfficiencyLabel } from '@/utils/reportStatusDistribution'

describe('buildReportStatusSegments', () => {
  it('derives in-progress count from open minus unassigned', () => {
    const segments = buildReportStatusSegments({
      conversations_resolved: 96,
      conversations_open: 18,
      conversations_open_unassigned: 4,
    })
    expect(segments.find((s) => s.key === 'in_progress')?.count).toBe(14)
    expect(segments.find((s) => s.key === 'unassigned')?.count).toBe(4)
  })
})

describe('resolutionEfficiencyLabel', () => {
  it('returns tier label from handled and resolved counts', () => {
    expect(resolutionEfficiencyLabel(128, 96)).toBe('Boa (75,0%)')
    expect(resolutionEfficiencyLabel(100, 95)).toBe('Excelente (95,0%)')
  })
})
