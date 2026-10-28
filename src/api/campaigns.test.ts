import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createCampaign, fetchCampaign } from '@/api/campaigns'
import { http } from '@/api/http'

vi.mock('@/api/http', () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('campaigns api', () => {
  beforeEach(() => {
    vi.mocked(http.get).mockReset()
    vi.mocked(http.post).mockReset()
  })

  it('fetchCampaign returns matching campaign from list', async () => {
    vi.mocked(http.get).mockResolvedValue({
      data: {
        data: [
          { id: 1, name: 'A', send_rate: 'default' },
          { id: 2, name: 'B', send_rate: '2/s' },
        ],
      },
    })

    const campaign = await fetchCampaign(2)
    expect(campaign.name).toBe('B')
    expect(campaign.send_rate).toBe('2/s')
  })

  it('createCampaign forwards send_rate in payload', async () => {
    vi.mocked(http.post).mockResolvedValue({
      data: { data: { id: 3, name: 'C', send_rate: '5/m' } },
    })

    await createCampaign({
      name: 'C',
      send_rate: '5/m',
    })

    expect(http.post).toHaveBeenCalledWith('/api/campaigns', {
      name: 'C',
      send_rate: '5/m',
    })
  })
})
