import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'

import { fetchCurrentSubscription } from '@/api/billing'
import { useCheckoutFlowStore } from '@/stores/checkoutFlow'
import BillingCheckoutView from '@/views/billing/BillingCheckoutView.vue'
import type { Subscription } from '@/types/billing'

const replace = vi.fn<(to: unknown) => Promise<void>>().mockResolvedValue(undefined)
const push = vi.fn<(to: unknown) => Promise<void>>().mockResolvedValue(undefined)

vi.mock('@/api/billing', () => ({
  checkoutSubscription: vi.fn<() => Promise<Subscription>>(),
  fetchCurrentSubscription: vi.fn<() => Promise<Subscription | null>>(),
}))

vi.mock('vue-router', () => ({
  RouterLink: defineComponent({
    name: 'RouterLink',
    props: { to: { type: [String, Object], required: true } },
    setup(_, { slots }) {
      return () => h('a', slots.default?.())
    },
  }),
  useRouter: () => ({ replace, push }),
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    user: { name: 'Test User', email: 'test@example.com' },
  }),
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

function activeSubscription(): Subscription {
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
  }
}

async function mountCheckout() {
  const pinia = createPinia()
  setActivePinia(pinia)
  const checkoutFlow = useCheckoutFlowStore()
  checkoutFlow.setPlanSelection({
    modality: 'included',
    tier: 'profissional',
    cycle: 'YEARLY',
    planId: 'plan-1',
    planName: 'Profissional',
    amount: 3970,
    modalityLabel: 'Mensagens incluídas',
  })

  const wrapper = mount(BillingCheckoutView, {
    global: {
      plugins: [pinia],
      stubs: {
        OnboardingShell: shellStub,
        OnboardingActionBar: true,
        BillingCheckoutForms: true,
        UiCard: { template: '<div><slot /></div>' },
        UiBadge: true,
        UiInput: true,
      },
    },
  })

  await flushPromises()
  return { wrapper, checkoutFlow }
}

describe('BillingCheckoutView subscription guard', () => {
  beforeEach(() => {
    replace.mockReset()
    push.mockReset()
    vi.mocked(fetchCurrentSubscription).mockReset()
  })

  it('redirects and clears checkout when subscription is ACTIVE', async () => {
    vi.mocked(fetchCurrentSubscription).mockResolvedValue(activeSubscription())

    const { checkoutFlow } = await mountCheckout()

    expect(replace).toHaveBeenCalledWith({ name: 'painel' })
    expect(checkoutFlow.planId).toBe('')
    expect(document.body.textContent).not.toContain('Finalizar contratação')
  })

  it('never renders checkout form while ACTIVE redirect is pending', async () => {
    let resolveReplace!: () => void
    replace.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveReplace = resolve
        }),
    )
    vi.mocked(fetchCurrentSubscription).mockResolvedValue(activeSubscription())

    const pinia = createPinia()
    setActivePinia(pinia)
    const checkoutFlow = useCheckoutFlowStore()
    checkoutFlow.setPlanSelection({
      modality: 'included',
      tier: 'profissional',
      cycle: 'YEARLY',
      planId: 'plan-1',
      planName: 'Profissional',
      amount: 3970,
      modalityLabel: 'Mensagens incluídas',
    })

    const wrapper = mount(BillingCheckoutView, {
      global: {
        plugins: [pinia],
        stubs: {
          OnboardingShell: shellStub,
          OnboardingActionBar: true,
          BillingCheckoutForms: true,
          UiCard: { template: '<div><slot /></div>' },
          UiBadge: true,
          UiInput: true,
        },
      },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Verificando assinatura')
    expect(wrapper.text()).not.toContain('Finalizar contratação')

    resolveReplace()
    await flushPromises()

    expect(wrapper.text()).not.toContain('Finalizar contratação')
    expect(wrapper.text()).toContain('Verificando assinatura')
  })

  it('shows checkout form when there is no subscription', async () => {
    vi.mocked(fetchCurrentSubscription).mockResolvedValue(null)

    const { wrapper } = await mountCheckout()

    expect(replace).not.toHaveBeenCalledWith({ name: 'painel' })
    expect(wrapper.text()).toContain('Finalizar contratação')
  })

  it('shows checkout form when subscription check fails', async () => {
    vi.mocked(fetchCurrentSubscription).mockRejectedValue(new Error('network'))

    const { wrapper } = await mountCheckout()

    expect(replace).not.toHaveBeenCalledWith({ name: 'painel' })
    expect(wrapper.text()).toContain('Finalizar contratação')
  })
})
