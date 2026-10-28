import { http } from '@/api/http'
import type {
  BillingPayment,
  BillingPlansResponse,
  ChangePlanPayload,
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

export async function fetchBillingPlans(): Promise<BillingPlansResponse> {
  const { data } = await http.get<BillingPlansResponse>('/api/billing/plans')
  return data
}

export async function fetchCurrentSubscription(): Promise<Subscription | null> {
  const { data } = await http.get<SubscriptionResponse>('/api/billing/subscription')
  return parseSubscriptionResponse(data)
}

export async function checkoutSubscription(payload: CheckoutPayload): Promise<Subscription> {
  const { data } = await http.post<Subscription>('/api/billing/subscription', {
    modality: payload.modality,
    tier: payload.tier,
    cycle: payload.cycle,
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

export async function changeSubscriptionPlan(payload: ChangePlanPayload): Promise<Subscription> {
  const { data } = await http.put<Subscription>('/api/billing/subscription', payload)
  return data
}

export async function cancelSubscription(): Promise<Subscription> {
  const { data } = await http.delete<Subscription>('/api/billing/subscription', {
    data: { confirm: true },
  })
  return data
}

export async function updateSubscriptionPaymentMethod(
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

export async function fetchBillingPayments(): Promise<BillingPayment[]> {
  const { data } = await http.get<BillingPayment[] | { data: BillingPayment[] }>(
    '/api/billing/payments',
  )
  if (Array.isArray(data)) {
    return data
  }
  return data.data ?? []
}
