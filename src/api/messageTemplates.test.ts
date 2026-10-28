import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createMessageTemplate,
  fetchMessageTemplatesList,
  syncMessageTemplates,
} from '@/api/messageTemplates'
import { http } from '@/api/http'

vi.mock('@/api/http', () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('messageTemplates api', () => {
  beforeEach(() => {
    vi.mocked(http.get).mockReset()
    vi.mocked(http.post).mockReset()
  })

  it('fetchMessageTemplatesList parses templates and whatsapp_configured meta', async () => {
    vi.mocked(http.get).mockResolvedValue({
      data: {
        data: [{ id: 1, name: 'local_model', status: 'APPROVED', approved: true }],
        meta: { whatsapp_configured: false },
      },
    })

    const result = await fetchMessageTemplatesList()
    expect(result.templates).toHaveLength(1)
    expect(result.templates[0]?.name).toBe('local_model')
    expect(result.whatsappConfigured).toBe(false)
  })

  it('syncMessageTemplates returns synced count', async () => {
    vi.mocked(http.post).mockResolvedValue({
      data: {
        data: [{ id: 2, name: 'lembrete_retorno', status: 'APPROVED', approved: true }],
        meta: { synced: 1, whatsapp_configured: true },
      },
    })

    const result = await syncMessageTemplates()
    expect(result.synced).toBe(1)
    expect(result.templates[0]?.name).toBe('lembrete_retorno')
    expect(http.post).toHaveBeenCalledWith('/api/message-templates/sync')
  })

  it('createMessageTemplate posts payload to API', async () => {
    vi.mocked(http.post).mockResolvedValue({
      data: {
        data: { id: 3, name: 'novo_modelo', status: 'PENDING', approved: false },
      },
    })

    await createMessageTemplate({
      name: 'novo_modelo',
      language: 'pt_BR',
      category: 'MARKETING',
      components: [{ type: 'BODY', text: 'Promoção {{1}}' }],
    })

    expect(http.post).toHaveBeenCalledWith('/api/message-templates', {
      name: 'novo_modelo',
      language: 'pt_BR',
      category: 'MARKETING',
      components: [{ type: 'BODY', text: 'Promoção {{1}}' }],
    })
  })
})
