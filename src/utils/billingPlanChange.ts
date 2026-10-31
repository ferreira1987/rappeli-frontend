import type { BillingCycle, BillingModality, ChangePlanPayload, Subscription } from '@/types/billing'

export type PlanSelection = {
  modality: BillingModality
  tier: string
  cycle: BillingCycle
}

export function planSelectionMatchesSubscription(
  subscription: Subscription,
  selection: PlanSelection,
): boolean {
  return (
    subscription.modality === selection.modality &&
    subscription.tier === selection.tier &&
    subscription.cycle === selection.cycle
  )
}

export function buildChangePlanPayload(selection: PlanSelection): ChangePlanPayload {
  return {
    modality: selection.modality,
    tier: selection.tier,
    cycle: selection.cycle,
  }
}

export type PlanChangeContinueAction =
  | { kind: 'checkout' }
  | { kind: 'redirect'; routeName: 'minha-assinatura' }
  | { kind: 'confirm-change'; payload: ChangePlanPayload }

export function resolvePlanContinueAction(input: {
  subscription: Subscription | null
  selection: PlanSelection
}): PlanChangeContinueAction {
  if (input.subscription?.status !== 'ACTIVE') {
    return { kind: 'checkout' }
  }

  if (planSelectionMatchesSubscription(input.subscription, input.selection)) {
    return { kind: 'redirect', routeName: 'minha-assinatura' }
  }

  return {
    kind: 'confirm-change',
    payload: buildChangePlanPayload(input.selection),
  }
}
