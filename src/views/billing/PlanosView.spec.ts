import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'

import {
  changeSubscriptionPlan,
  fetchBillingPlans,
  fetchCurrentSubscription,
} from '@/api/billing'
import type { BillingPlansResponse, Subscription } from '@/types/billing'
import PlanosView from '@/views/billing/PlanosView.vue'

const push = vi.fn<(to: unknown) => Promise<void>>().mockResolvedValue(undefined)

vi.mock('@/api/billing', () => ({
  fetchBillingPlans: vi.fn<() => Promise<BillingPlansResponse>>(),
  fetchCurrentSubscription: vi.fn<() => Promise<Subscription | null>>(),
  changeSubscriptionPlan: vi.fn<(payload: unknown) => Promise<Subscription>>(),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
}))

const shellStub = defineComponent({
  name: 'OnboardingShell',
  setup(_, { slots }) {
    return () =>
      h('div', [
        slots.default?.(),
        slots['action-bar'] ? h('div', { 'data-testid': 'action-bar' }, slots['action-bar']()) : null,
      ])
  },
})

const catalog: BillingPlansResponse = {
  modes: {
    included: {
      label: 'Mensagens incluídas',
      plans: [
        {
          id: 'prof-yearly',
          tier: 'profissional',
          name: 'Profissional',
          cycle: 'YEARLY',
          amount: 3970,
        },
        {
          id: 'escala-yearly',
          tier: 'escala',
          name: 'Escala',
          cycle: 'YEARLY',
          amount: 7970,
        },
      ],
    },
    meta_direct: { label: 'Meta direto', plans: [] },
  },
  shared_benefits: [],
  free_trial: false,
  setup_fee: false,
}

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

async function mountPlanos() {
  const pinia = createPinia()
  setActivePinia(pinia)

  const wrapper = mount(PlanosView, {
    global: {
      plugins: [pinia],
      stubs: {
        OnboardingShell: shellStub,
        OnboardingActionBar: false,
        AppConfirmModal: false,
        Teleport: true,
        UiCard: { template: '<div><slot /></div>' },
        UiBadge: true,
        UiButton: true,
        UiFilterChip: true,
      },
    },
  })

  await flushPromises()
  return wrapper
}

describe('PlanosView plan change (ACTIVE subscription)', () => {
  beforeEach(() => {
    push.mockReset()
    vi.mocked(fetchBillingPlans).mockResolvedValue(catalog)
    vi.mocked(fetchCurrentSubscription).mockResolvedValue(activeSubscription())
    vi.mocked(changeSubscriptionPlan).mockReset()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows Plano atual and disables continue when selection matches subscription', async () => {
    const wrapper = await mountPlanos()

    const primaryButton = wrapper.find('[data-onboarding-action-bar] button[type="button"]')
    expect(primaryButton.text()).toContain('Plano atual')
    expect(primaryButton.attributes('disabled')).toBeDefined()
  })

  it('calls changeSubscriptionPlan on confirm and then redirects to minha-assinatura', async () => {
    vi.mocked(changeSubscriptionPlan).mockResolvedValue(
      activeSubscription({ tier: 'escala', plan_name: 'Escala', value: 7970 }),
    )

    const wrapper = await mountPlanos()
    const vm = wrapper.vm as unknown as { selectTier: (tier: string) => void }
    vm.selectTier('escala')
    await flushPromises()

    const primaryButton = wrapper.find('[data-onboarding-action-bar] button[type="button"]')
    expect(primaryButton.text()).toContain('Continuar')
    await primaryButton.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Confirmar alteração de plano')

    await wrapper.findComponent({ name: 'AppConfirmModal' }).vm.$emit('confirm')
    await flushPromises()

    expect(changeSubscriptionPlan).toHaveBeenCalledWith({
      modality: 'included',
      tier: 'escala',
      cycle: 'YEARLY',
    })

    expect(wrapper.text()).toContain('Plano alterado para Escala')

    await vi.advanceTimersByTimeAsync(1200)
    await flushPromises()

    expect(push).toHaveBeenCalledWith({ name: 'minha-assinatura' })
  })

  it('shows friendly error and does not redirect when change fails', async () => {
    vi.mocked(changeSubscriptionPlan).mockRejectedValue(new Error('Falha no servidor'))

    const wrapper = await mountPlanos()
    const vm = wrapper.vm as unknown as { selectTier: (tier: string) => void }
    vm.selectTier('escala')
    await flushPromises()

    await wrapper.find('[data-onboarding-action-bar] button[type="button"]').trigger('click')
    await flushPromises()

    await wrapper.findComponent({ name: 'AppConfirmModal' }).vm.$emit('confirm')
    await flushPromises()

    expect(wrapper.text()).toContain('Falha no servidor')
    expect(push).not.toHaveBeenCalledWith({ name: 'minha-assinatura' })
  })
})
