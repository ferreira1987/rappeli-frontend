import { describe, expect, it } from 'vitest'

import type { Subscription } from '@/types/billing'
import {
  buildChangePlanPayload,
  planSelectionMatchesSubscription,
  resolvePlanContinueAction,
} from '@/utils/billingPlanChange'

function activeSubscription(overrides: Partial<Subscription> = {}): Subscription {
  return {
    id: 1,
    plan: 'profissional-yearly',
    plan_name: 'Profissional',
    modality: 'included',
    modality_label: 'Mensagens incluídas',
    tier: 'profissional',
    cycle: 'YEARLY',
    status: 'ACTIVE',
    value: 3970,
    next_due_date: null,
    payment_method: { brand: 'visa', last_digits: '4242' },
    cancelled_at: null,
    ...overrides,
  }
}

describe('billingPlanChange', () => {
  it('buildChangePlanPayload sends modality, tier and cycle', () => {
    expect(
      buildChangePlanPayload({
        modality: 'meta_direct',
        tier: 'escala',
        cycle: 'MONTHLY',
      }),
    ).toEqual({
      modality: 'meta_direct',
      tier: 'escala',
      cycle: 'MONTHLY',
    })
  })

  it('resolvePlanContinueAction returns checkout when there is no ACTIVE subscription', () => {
    expect(
      resolvePlanContinueAction({
        subscription: null,
        selection: { modality: 'included', tier: 'profissional', cycle: 'YEARLY' },
      }),
    ).toEqual({ kind: 'checkout' })
  })

  it('resolvePlanContinueAction redirects when selection matches ACTIVE subscription', () => {
    const subscription = activeSubscription()
    expect(
      resolvePlanContinueAction({
        subscription,
        selection: {
          modality: subscription.modality,
          tier: subscription.tier,
          cycle: subscription.cycle,
        },
      }),
    ).toEqual({ kind: 'redirect', routeName: 'minha-assinatura' })
  })

  it('resolvePlanContinueAction requests confirm-change for a different plan', () => {
    const subscription = activeSubscription()
    expect(
      resolvePlanContinueAction({
        subscription,
        selection: { modality: 'included', tier: 'escala', cycle: 'YEARLY' },
      }),
    ).toEqual({
      kind: 'confirm-change',
      payload: { modality: 'included', tier: 'escala', cycle: 'YEARLY' },
    })
  })

  it('planSelectionMatchesSubscription compares modality, tier and cycle', () => {
    const subscription = activeSubscription()
    expect(
      planSelectionMatchesSubscription(subscription, {
        modality: 'included',
        tier: 'profissional',
        cycle: 'YEARLY',
      }),
    ).toBe(true)
    expect(
      planSelectionMatchesSubscription(subscription, {
        modality: 'included',
        tier: 'escala',
        cycle: 'YEARLY',
      }),
    ).toBe(false)
  })
})
