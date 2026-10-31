import type { RouteLocationRaw } from 'vue-router'

import type { Subscription, SubscriptionStatus } from '@/types/billing'

/**
 * Statuses that mean the tenant already has a billable subscription and must not
 * go through POST /api/billing/subscription (new checkout) again.
 *
 * The API only exposes ACTIVE | INACTIVE | CANCELED | EXPIRED — there is no
 * TRIALING or PAST_DUE in this frontend contract.
 */
export function subscriptionStatusBlocksCheckout(
  status: SubscriptionStatus | null | undefined,
): boolean {
  return status === 'ACTIVE'
}

export function shouldBlockCheckoutForSubscription(
  subscription: Subscription | null,
): boolean {
  return subscriptionStatusBlocksCheckout(subscription?.status)
}

export type ActiveSubscriptionRedirectContext = 'checkout' | 'planos'

/** Where to send users who already have an ACTIVE subscription. */
export function resolveActiveSubscriptionRedirect(
  context: ActiveSubscriptionRedirectContext,
): RouteLocationRaw {
  if (context === 'checkout') {
    return { name: 'painel' }
  }
  return { name: 'minha-assinatura' }
}
