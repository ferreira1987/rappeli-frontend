import { describe, expect, it } from 'vitest'

import { mapCreatedInvitationToPending } from '@/api/team'

describe('mapCreatedInvitationToPending', () => {
  it('maps POST response to pending list row', () => {
    const pending = mapCreatedInvitationToPending({
      id: 1,
      name: 'Ana',
      email: 'ana@test.com',
      role: 'atendente',
      sector_id: 2,
      expires_at: '2026-11-03T20:16:00+00:00',
      token: 'secret',
      email_queued: true,
    })

    expect(pending).toEqual({
      id: 1,
      name: 'Ana',
      email: 'ana@test.com',
      role: 'atendente',
      sector_id: 2,
      expires_at: '2026-11-03T20:16:00+00:00',
      status: 'pending',
    })
    expect(pending).not.toHaveProperty('token')
  })
})
