import { beforeEach, describe, expect, it, vi } from 'vitest'

import { http } from '@/api/http'
import { fetchBillingPlans, fetchCurrentSubscription } from '@/api/billing'

vi.mock('@/api/http', () => ({
  http: {
    get: vi.fn(),
  },
}))

describe('billing API', () => {
  beforeEach(() => {
    vi.mocked(http.get).mockReset()
  })

  it('fetchCurrentSubscription returns null when API sends { subscription: null }', async () => {
    vi.mocked(http.get).mockResolvedValue({ data: { subscription: null } })

    await expect(fetchCurrentSubscription()).resolves.toBeNull()
  })

  it('fetchBillingPlans reads catalog limits from root payload', async () => {
    vi.mocked(http.get).mockResolvedValue({
      data: {
        modes: { included: { label: 'Incluídas', plans: [] }, meta_direct: { label: 'Meta', plans: [] } },
        shared_benefits: [],
        free_trial: false,
        setup_fee: false,
        overage_price_per_message: 0.05,
        marketing_billed_separately: true,
        agents_limit: null,
      },
    })

    const catalog = await fetchBillingPlans()

    expect(catalog.agents_limit).toBeNull()
    expect(catalog.overage_price_per_message).toBe(0.05)
    expect(catalog.marketing_billed_separately).toBe(true)
  })
})
