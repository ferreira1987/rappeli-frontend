import { describe, expect, it } from 'vitest'

import type { Subscription } from '@/types/billing'
import {
  resolveActiveSubscriptionRedirect,
  shouldBlockCheckoutForSubscription,
  subscriptionStatusBlocksCheckout,
} from '@/utils/billingCheckoutGuard'

function subscriptionWithStatus(status: Subscription['status']): Subscription {
  return {
    id: 1,
    plan: 'profissional-yearly',
    plan_name: 'Profissional',
    modality: 'included',
    modality_label: 'Mensagens incluídas',
    tier: 'profissional',
    cycle: 'YEARLY',
    status,
    value: 3970,
    next_due_date: null,
    payment_method: { brand: 'visa', last_digits: '4242' },
    cancelled_at: null,
  }
}

describe('billingCheckoutGuard', () => {
  it('blocks checkout only for ACTIVE', () => {
    expect(subscriptionStatusBlocksCheckout('ACTIVE')).toBe(true)
    expect(subscriptionStatusBlocksCheckout('INACTIVE')).toBe(false)
    expect(subscriptionStatusBlocksCheckout('CANCELED')).toBe(false)
    expect(subscriptionStatusBlocksCheckout('EXPIRED')).toBe(false)
    expect(subscriptionStatusBlocksCheckout(undefined)).toBe(false)
  })

  it('shouldBlockCheckoutForSubscription mirrors subscription status', () => {
    expect(shouldBlockCheckoutForSubscription(subscriptionWithStatus('ACTIVE'))).toBe(true)
    expect(shouldBlockCheckoutForSubscription(null)).toBe(false)
    expect(shouldBlockCheckoutForSubscription(subscriptionWithStatus('INACTIVE'))).toBe(false)
  })

  it('resolveActiveSubscriptionRedirect sends checkout onboarding to painel and planos to minha assinatura', () => {
    expect(resolveActiveSubscriptionRedirect('checkout')).toEqual({ name: 'painel' })
    expect(resolveActiveSubscriptionRedirect('planos')).toEqual({ name: 'minha-assinatura' })
  })
})
