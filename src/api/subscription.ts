import { http } from '@/api/http'
import type {
  BillingPayment,
  CheckoutPayload,
  Subscription,
  SubscriptionResponse,
} from '@/types/billing'

function parseSubscriptionResponse(data: SubscriptionResponse): Subscription | null {
  if (data && typeof data === 'object' && 'subscription' in data && data.subscription === null) {
    return null
  }
  return data as Subscription
}

export async function fetchSubscription(): Promise<Subscription | null> {
  const { data } = await http.get<SubscriptionResponse>('/api/billing/subscription')
  return parseSubscriptionResponse(data)
}

export async function fetchSubscriptionPayments(): Promise<BillingPayment[]> {
  const { data } = await http.get<BillingPayment[] | { data: BillingPayment[] }>(
    '/api/billing/payments',
  )
  if (Array.isArray(data)) {
    return data
  }
  return data.data ?? []
}

export async function updateSubscriptionCard(
  payload: Omit<CheckoutPayload, 'modality' | 'tier' | 'cycle'>,
): Promise<Subscription> {
  const { data } = await http.put<Subscription>('/api/billing/subscription/payment-method', {
    holder: {
      ...payload.holder,
      cpf_cnpj: payload.holder.cpf_cnpj.replace(/\D/g, ''),
      phone: payload.holder.phone.replace(/\D/g, ''),
      postal_code: payload.holder.postal_code.replace(/\D/g, ''),
    },
    credit_card: {
      ...payload.credit_card,
      number: payload.credit_card.number.replace(/\D/g, ''),
      expiry_month: payload.credit_card.expiry_month.padStart(2, '0').slice(-2),
    },
  })
  return data
}

export async function cancelSubscription(): Promise<Subscription> {
  const { data } = await http.post<Subscription>('/api/billing/subscription/cancel', {
    confirm: true,
  })
  return data
}
