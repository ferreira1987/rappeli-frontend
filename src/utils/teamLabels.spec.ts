import { describe, expect, it } from 'vitest'

import { formatAgentDisplayName, formatReportAgentDisplayName } from '@/utils/teamLabels'

describe('formatAgentDisplayName', () => {
  const agents = [
    { name: 'Ana', email: 'ana@a.com' },
    { name: 'Ana', email: 'ana2@b.com' },
    { name: 'Bruno', email: 'bruno@c.com' },
  ]

  it('returns name only when unique', () => {
    const bruno = agents[2]!
    expect(formatAgentDisplayName(bruno, agents)).toBe('Bruno')
  })

  it('appends email when names collide', () => {
    const ana = agents[0]!
    expect(formatAgentDisplayName(ana, agents)).toBe('Ana (ana@a.com)')
  })
})

describe('formatReportAgentDisplayName', () => {
  const rows = [
    { user_id: 1, name: 'Ana', email: 'ana@a.com' },
    { user_id: 2, name: 'Ana', email: 'ana2@b.com' },
    { user_id: 3, name: 'Bruno' },
  ]

  it('uses email when available and names collide', () => {
    const ana = rows[0]!
    expect(formatReportAgentDisplayName(ana, rows)).toBe('Ana (ana@a.com)')
  })

  it('falls back to user id without email', () => {
    const bruno = rows[2]!
    expect(formatReportAgentDisplayName(bruno, [{ user_id: 4, name: 'Bruno' }, bruno])).toBe('Bruno (#3)')
  })
})
