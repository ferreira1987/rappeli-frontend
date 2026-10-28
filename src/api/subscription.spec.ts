import { beforeEach, describe, expect, it, vi } from 'vitest'

import { http } from '@/api/http'
import {
  cancelSubscription,
  fetchSubscription,
  fetchSubscriptionPayments,
  updateSubscriptionCard,
} from '@/api/subscription'

vi.mock('@/api/http', () => ({
  http: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
  },
}))

describe('subscription API', () => {
  beforeEach(() => {
    vi.mocked(http.get).mockReset()
    vi.mocked(http.put).mockReset()
    vi.mocked(http.post).mockReset()
  })

  it('fetchSubscription calls GET /api/subscription', async () => {
    vi.mocked(http.get).mockResolvedValue({
      data: { id: 1, plan_name: 'Pro', status: 'ACTIVE' },
    })

    const sub = await fetchSubscription()

    expect(http.get).toHaveBeenCalledWith('/api/subscription')
    expect(sub?.plan_name).toBe('Pro')
  })

  it('fetchSubscriptionPayments normalizes paginated payload', async () => {
    vi.mocked(http.get).mockResolvedValue({
      data: { data: [{ id: 2, value: 99 }] },
    })

    const payments = await fetchSubscriptionPayments()

    expect(http.get).toHaveBeenCalledWith('/api/subscription/payments')
    expect(payments).toHaveLength(1)
  })

  it('updateSubscriptionCard strips document digits', async () => {
    vi.mocked(http.put).mockResolvedValue({ data: { id: 1 } })

    await updateSubscriptionCard({
      holder: {
        name: 'Ana',
        cpf_cnpj: '12.345.678/0001-90',
        email: 'a@test.com',
        phone: '(11) 99999-9999',
        postal_code: '01310-100',
        address_number: '100',
      },
      credit_card: {
        holder_name: 'Ana',
        number: '4111 1111 1111 1111',
        expiry_month: '12',
        expiry_year: '2030',
        cvv: '123',
      },
    })

    expect(http.put).toHaveBeenCalledWith(
      '/api/subscription/card',
      expect.objectContaining({
        holder: expect.objectContaining({ cpf_cnpj: '12345678000190' }),
      }),
    )
  })

  it('cancelSubscription posts confirmation', async () => {
    vi.mocked(http.post).mockResolvedValue({ data: { status: 'CANCELED' } })

    await cancelSubscription()

    expect(http.post).toHaveBeenCalledWith('/api/subscription/cancel', { confirm: true })
  })
})
