import { beforeEach, describe, expect, it, vi } from 'vitest'

import { acceptTeamInvitation, mapCreatedInvitationToPending } from '@/api/team'
import { http } from '@/api/http'

vi.mock('@/api/auth', () => ({
  fetchCsrfCookie: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/api/http', () => ({
  http: {
    post: vi.fn(),
  },
}))

describe('acceptTeamInvitation', () => {
  beforeEach(() => {
    vi.mocked(http.post).mockReset()
  })

  it('returns user from root JSON like login/register', async () => {
    vi.mocked(http.post).mockResolvedValue({
      data: {
        user: {
          id: 9,
          name: 'Ana',
          email: 'ana@test.com',
          company_id: 3,
        },
      },
    })

    const user = await acceptTeamInvitation({
      token: 'invite-token',
      password: 'secret123',
      password_confirmation: 'secret123',
      terms_accepted: true,
    })

    expect(http.post).toHaveBeenCalledWith('/api/team/invitations/accept', {
      token: 'invite-token',
      password: 'secret123',
      password_confirmation: 'secret123',
      terms_accepted: true,
    })
    expect(user).toEqual({
      id: 9,
      name: 'Ana',
      email: 'ana@test.com',
      company_id: 3,
    })
  })
})

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
