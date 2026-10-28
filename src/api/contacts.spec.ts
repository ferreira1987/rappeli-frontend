import { beforeEach, describe, expect, it, vi } from 'vitest'

import { http } from '@/api/http'
import { deleteContact, updateContact } from '@/api/contacts'

vi.mock('@/api/http', () => ({
  http: {
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('contacts API', () => {
  beforeEach(() => {
    vi.mocked(http.patch).mockReset()
    vi.mocked(http.delete).mockReset()
  })

  it('updateContact uses PATCH /api/contacts/{id}', async () => {
    vi.mocked(http.patch).mockResolvedValue({
      data: { data: { id: 1, phone: '5511999887766', display_name: 'Ana', marketing_opt_in: false } },
    })

    await updateContact(1, { display_name: 'Ana' })

    expect(http.patch).toHaveBeenCalledWith('/api/contacts/1', { display_name: 'Ana' })
  })

  it('deleteContact uses DELETE /api/contacts/{id}', async () => {
    vi.mocked(http.delete).mockResolvedValue({ data: null })

    await deleteContact(42)

    expect(http.delete).toHaveBeenCalledWith('/api/contacts/42')
  })
})
