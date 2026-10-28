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

  it('fetchSubscription calls GET /api/billing/subscription without wrapper', async () => {
    vi.mocked(http.get).mockResolvedValue({
      data: {
        id: 1,
        plan_name: 'Pro',
        status: 'ACTIVE',
        payment_method: { brand: 'VISA', last_digits: '4242' },
        next_due_date: '2026-11-01',
      },
    })

    const sub = await fetchSubscription()

    expect(http.get).toHaveBeenCalledWith('/api/billing/subscription')
    expect(sub?.plan_name).toBe('Pro')
    expect(sub?.payment_method.last_digits).toBe('4242')
  })

  it('fetchSubscription treats subscription null wrapper as empty', async () => {
    vi.mocked(http.get).mockResolvedValue({ data: { subscription: null } })

    await expect(fetchSubscription()).resolves.toBeNull()
  })

  it('fetchSubscriptionPayments reads Laravel data collection', async () => {
    vi.mocked(http.get).mockResolvedValue({
      data: { data: [{ id: 2, value: 99, asaas_payment_id: 'pay_1' }] },
    })

    const payments = await fetchSubscriptionPayments()

    expect(http.get).toHaveBeenCalledWith('/api/billing/payments')
    expect(payments).toHaveLength(1)
  })

  it('updateSubscriptionCard uses payment-method route', async () => {
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
      '/api/billing/subscription/payment-method',
      expect.objectContaining({
        holder: expect.objectContaining({ cpf_cnpj: '12345678000190' }),
      }),
    )
  })

  it('cancelSubscription posts confirmation to billing cancel route', async () => {
    vi.mocked(http.post).mockResolvedValue({ data: { status: 'CANCELED' } })

    await cancelSubscription()

    expect(http.post).toHaveBeenCalledWith('/api/billing/subscription/cancel', { confirm: true })
  })
})
