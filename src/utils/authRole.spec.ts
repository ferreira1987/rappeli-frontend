import { describe, expect, it } from 'vitest'

import { isCompanyAdministrator } from '@/utils/authRole'

describe('isCompanyAdministrator', () => {
  it('returns true for administrador role from /api/me', () => {
    expect(isCompanyAdministrator({ id: 1, name: 'A', email: 'a@test.com', role: 'administrador' })).toBe(
      true,
    )
  })

  it('returns false for other roles or missing role', () => {
    expect(isCompanyAdministrator({ id: 1, name: 'A', email: 'a@test.com', role: 'atendente' })).toBe(false)
    expect(isCompanyAdministrator({ id: 1, name: 'A', email: 'a@test.com' })).toBe(false)
    expect(isCompanyAdministrator(null)).toBe(false)
  })
})
