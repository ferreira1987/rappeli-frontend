import { beforeEach, describe, expect, it, vi } from 'vitest'

import { moveFunnelCard } from '@/api/funnel'
import { http } from '@/api/http'

vi.mock('@/api/http', () => ({
  http: {
    patch: vi.fn(),
  },
}))

describe('funnel api', () => {
  beforeEach(() => {
    vi.mocked(http.patch).mockReset()
  })

  it('moveFunnelCard patches move endpoint with stage and position', async () => {
    vi.mocked(http.patch).mockResolvedValue({
      data: { data: { id: 5, funnel_stage_id: 2, position: 1 } },
    })

    const card = await moveFunnelCard(5, { funnel_stage_id: 2, position: 1 })

    expect(http.patch).toHaveBeenCalledWith('/api/funnel/cards/5/move', {
      funnel_stage_id: 2,
      position: 1,
    })
    expect(card.funnel_stage_id).toBe(2)
  })
})
