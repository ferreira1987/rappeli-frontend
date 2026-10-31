<script setup lang="ts">
import { Check, CheckCircle2, Info, LockOpen, PiggyBank, Star, UserRound } from '@lucide/vue'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import {
  changeSubscriptionPlan,
  fetchBillingPlans,
  fetchCurrentSubscription,
} from '@/api/billing'
import AppConfirmModal from '@/components/app/AppConfirmModal.vue'
import OnboardingActionBar from '@/components/onboarding/OnboardingActionBar.vue'
import OnboardingShell from '@/components/onboarding/OnboardingShell.vue'
import { UiBadge, UiButton, UiCard, UiFilterChip } from '@/components/ui'
import {
  PLAN_TIER_FEATURES,
  PLAN_TIER_SUBTITLES,
  type PlanTierId,
} from '@/constants/onboardingPlans'
import { useCheckoutFlowStore } from '@/stores/checkoutFlow'
import type {
  BillingCycle,
  BillingModality,
  BillingPlanItem,
  BillingPlansResponse,
  Subscription,
} from '@/types/billing'
import { formatPlanAmountCompact, billingCycleLabel } from '@/utils/billingFormat'
import {
  planSelectionMatchesSubscription,
  resolvePlanContinueAction,
} from '@/utils/billingPlanChange'
import { getErrorMessage } from '@/utils/errors'

const router = useRouter()
const checkoutFlow = useCheckoutFlowStore()
const activeSubscription = ref<Subscription | null>(null)

const loading = ref(true)
const error = ref<string | null>(null)
const catalog = ref<BillingPlansResponse | null>(null)

const planChangeConfirmOpen = ref(false)
const planChangeLoading = ref(false)
const planChangeError = ref<string | null>(null)
const planChangeSuccessMessage = ref<string | null>(null)
const pendingChangePayload = ref<ReturnType<typeof resolvePlanContinueAction> | null>(null)

const cycle = ref<BillingCycle>(checkoutFlow.cycle)
const modality = ref<BillingModality>(checkoutFlow.modality)
const selectedTier = ref<string>(checkoutFlow.tier)

const tierOrder: PlanTierId[] = ['essencial', 'profissional', 'escala']

const modalities = computed(() => {
  if (!catalog.value) {
    return [] as { id: BillingModality; label: string }[]
  }
  return (['included', 'meta_direct'] as BillingModality[]).map((id) => ({
    id,
    label: catalog.value!.modes[id]?.label ?? id,
  }))
})

const plansByTier = computed(() => {
  const map = new Map<string, BillingPlanItem>()
  if (!catalog.value) {
    return map
  }
  for (const plan of catalog.value.modes[modality.value]?.plans ?? []) {
    if (plan.cycle === cycle.value) {
      map.set(plan.tier, plan)
    }
  }
  return map
})

const monthlyCompareByTier = computed(() => {
  const map = new Map<string, BillingPlanItem>()
  if (!catalog.value) {
    return map
  }
  for (const plan of catalog.value.modes[modality.value]?.plans ?? []) {
    if (plan.cycle === 'MONTHLY') {
      map.set(plan.tier, plan)
    }
  }
  return map
})

const selectedPlan = computed(() => plansByTier.value.get(selectedTier.value) ?? null)

const currentPlanSelection = computed(() => ({
  modality: modality.value,
  tier: selectedTier.value,
  cycle: cycle.value,
}))

const hasActiveSubscription = computed(
  () => activeSubscription.value?.status === 'ACTIVE',
)

const isCurrentPlanSelection = computed(() => {
  if (!activeSubscription.value || !hasActiveSubscription.value) {
    return false
  }
  return planSelectionMatchesSubscription(activeSubscription.value, currentPlanSelection.value)
})

const actionPrimaryLabel = computed(() => {
  if (hasActiveSubscription.value && isCurrentPlanSelection.value) {
    return 'Plano atual'
  }
  return 'Continuar'
})

const actionPrimaryDisabled = computed(() => {
  if (!selectedPlan.value) {
    return true
  }
  if (hasActiveSubscription.value && isCurrentPlanSelection.value) {
    return true
  }
  return false
})

const planChangeConfirmMessage = computed(() => {
  const current = activeSubscription.value
  const next = selectedPlan.value
  if (!current || !next || !catalog.value) {
    return ''
  }
  const currentCycle = billingCycleLabel(current.cycle)
  const nextCycle = billingCycleLabel(next.cycle)
  const currentAmount = formatPlanAmountCompact(current.value)
  const nextAmount = formatPlanAmountCompact(next.amount)
  const nextModalityLabel = catalog.value.modes[modality.value]?.label ?? current.modality_label

  return [
    `Plano atual: ${current.plan_name} — ${current.modality_label} — ${currentCycle} ${currentAmount}`,
    `Novo plano: ${next.name} — ${nextModalityLabel} — ${nextCycle} ${nextAmount}`,
    'Confirme para alterar a assinatura.',
  ].join('\n\n')
})

const selectedSummary = computed(() => {
  if (!selectedPlan.value) {
    return ''
  }
  const amount = formatPlanAmountCompact(selectedPlan.value.amount)
  const cycleLabel = billingCycleLabel(cycle.value)
  return `${selectedPlan.value.name} (${cycleLabel} ${amount})`
})

const selectedSummaryV5 = computed(() => {
  if (!selectedPlan.value) {
    return ''
  }
  const amount = formatPlanAmountCompact(selectedPlan.value.amount)
  const cycleLabel = billingCycleLabel(cycle.value)
  const suffix = cycle.value === 'MONTHLY' ? '/mês' : '/ano'
  return `Plano selecionado: ${selectedPlan.value.name} • ${cycleLabel} ${amount}${suffix}`
})

const overagePriceLabel = computed(() => {
  const price = catalog.value?.overage_price_per_message ?? 0.05
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
})

const marketingSeparateCopy = computed(() =>
  catalog.value?.marketing_billed_separately !== false
    ? 'Mensagens de marketing são cobradas à parte (tabela Meta).'
    : '',
)

watch([modality, cycle], () => {
  if (!plansByTier.value.has(selectedTier.value)) {
    const first = tierOrder.find((tier) => plansByTier.value.has(tier))
    if (first) {
      selectedTier.value = first
    }
  }
})

onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    catalog.value = await fetchBillingPlans()
    if (!plansByTier.value.has(selectedTier.value)) {
      selectedTier.value = 'profissional'
    }
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }

  try {
    const subscription = await fetchCurrentSubscription()
    if (subscription?.status === 'ACTIVE') {
      activeSubscription.value = subscription
      modality.value = subscription.modality
      cycle.value = subscription.cycle
      selectedTier.value = subscription.tier
    }
  } catch {
    // Assinatura atual é opcional na escolha de plano; não bloqueia a tela.
  }
})

async function retryLoadPlans(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    catalog.value = await fetchBillingPlans()
    if (!plansByTier.value.has(selectedTier.value)) {
      selectedTier.value = 'profissional'
    }
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}

function isActivePlanTier(tier: string): boolean {
  return (
    activeSubscription.value?.status === 'ACTIVE' && activeSubscription.value.tier === tier
  )
}

function selectTier(tier: string): void {
  selectedTier.value = tier
}

function priceBlock(plan: BillingPlanItem) {
  const monthlyRef = monthlyCompareByTier.value.get(plan.tier)
  if (cycle.value === 'MONTHLY') {
    return {
      main: formatPlanAmountCompact(plan.amount),
      suffix: '/mês',
      sub: null as string | null,
    }
  }
  const equivalent = plan.amount / 12
  const monthlyText = monthlyRef ? formatPlanAmountCompact(monthlyRef.amount) : ''
  return {
    main: formatPlanAmountCompact(plan.amount),
    suffix: '/ano',
    sub: `equivale a ${formatPlanAmountCompact(equivalent)}/mês${monthlyText ? ` (mensal ${monthlyText}/mês)` : ''}`,
  }
}

function continueToPayment(): void {
  const plan = selectedPlan.value
  if (!plan || !catalog.value) {
    return
  }

  planChangeError.value = null

  const action = resolvePlanContinueAction({
    subscription: activeSubscription.value,
    selection: currentPlanSelection.value,
  })

  if (action.kind === 'redirect') {
    checkoutFlow.clearCheckoutPlan()
    void router.push({ name: action.routeName })
    return
  }

  if (action.kind === 'confirm-change') {
    pendingChangePayload.value = action
    planChangeConfirmOpen.value = true
    return
  }

  checkoutFlow.setPlanSelection({
    modality: modality.value,
    tier: plan.tier,
    cycle: plan.cycle,
    planId: plan.id,
    planName: plan.name,
    amount: plan.amount,
    modalityLabel: catalog.value.modes[modality.value]?.label ?? '',
  })
  void router.push({ name: 'assinatura-checkout' })
}

function closePlanChangeConfirm(): void {
  if (planChangeLoading.value) {
    return
  }
  planChangeConfirmOpen.value = false
  pendingChangePayload.value = null
}

async function confirmPlanChange(): Promise<void> {
  const pending = pendingChangePayload.value
  if (!pending || pending.kind !== 'confirm-change') {
    return
  }

  planChangeLoading.value = true
  planChangeError.value = null
  try {
    const updated = await changeSubscriptionPlan(pending.payload)
    activeSubscription.value = updated
    checkoutFlow.clearCheckoutPlan()
    planChangeConfirmOpen.value = false
    pendingChangePayload.value = null
    planChangeSuccessMessage.value = `Plano alterado para ${updated.plan_name}.`
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 1200))
    void router.push({ name: 'minha-assinatura' })
  } catch (err) {
    planChangeError.value = getErrorMessage(err)
  } finally {
    planChangeLoading.value = false
  }
}

function goBack(): void {
  void router.push({ name: 'cadastro' })
}
</script>

<template>
  <OnboardingShell :step="2" shell-variant="cadastro-v5" reserve-action-bar-space @back="goBack">
    <div class="onboarding-action-bar-scroll mx-auto w-full max-w-6xl">
      <header class="mb-8 text-center md:text-left">
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Escolha o plano
        </h1>
        <p class="mt-2 text-sm leading-relaxed text-slate-500 sm:text-base">
          Sem taxa de implantação, sem fidelidade. Cancele quando quiser em 1 clique.
        </p>
      </header>

      <p
        v-if="planChangeSuccessMessage"
        class="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
        role="status"
      >
        {{ planChangeSuccessMessage }}
      </p>
      <p
        v-if="planChangeError"
        class="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        role="alert"
      >
        {{ planChangeError }}
      </p>

      <p v-if="loading" class="py-10 text-center text-sm text-slate-500">Carregando planos…</p>
      <div
        v-else-if="error"
        class="mx-auto max-w-md rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center"
      >
        <p class="text-sm text-red-800">{{ error }}</p>
        <UiButton type="button" class="mt-4" @click="retryLoadPlans"> Tentar novamente </UiButton>
      </div>

      <template v-else-if="catalog">
        <div
          class="mb-8 flex flex-col items-stretch justify-center gap-4 lg:flex-row lg:flex-wrap lg:items-center lg:gap-6"
          role="group"
          aria-label="Modalidade e ciclo de cobrança"
        >
          <div
            class="inline-flex flex-wrap justify-center gap-1 rounded-full border border-slate-200 bg-white p-1 lg:justify-start"
          >
            <UiFilterChip
              v-for="mode in modalities"
              :key="mode.id"
              :active="modality === mode.id"
              class="!rounded-full"
              @click="modality = mode.id"
            >
              {{ mode.label }}
            </UiFilterChip>
          </div>
          <div class="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <div
              class="inline-flex gap-1 rounded-full border border-slate-200 bg-white p-1"
              role="group"
              aria-label="Ciclo de cobrança"
            >
              <UiFilterChip
                :active="cycle === 'MONTHLY'"
                class="!rounded-full"
                @click="cycle = 'MONTHLY'"
              >
                Mensal
              </UiFilterChip>
              <UiFilterChip
                :active="cycle === 'YEARLY'"
                class="!rounded-full"
                @click="cycle = 'YEARLY'"
              >
                Anual
              </UiFilterChip>
            </div>
            <UiBadge
              v-if="cycle === 'YEARLY'"
              variant="warning"
              size="md"
              class="inline-flex items-center gap-1 !rounded-full px-2.5 py-1"
            >
              <PiggyBank class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Economize ~17% (2 meses grátis)
            </UiBadge>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 xl:gap-6">
          <UiCard
            v-for="tier in tierOrder"
            :key="tier"
            padding="none"
            class="relative flex h-full flex-col overflow-visible transition-shadow"
            :class="
              selectedTier === tier
                ? 'border-2 border-[#4338CA] shadow-md ring-1 ring-[#4338CA]/10'
                : 'border-slate-200 shadow-sm hover:border-slate-300'
            "
          >
            <div
              v-if="tier === 'profissional'"
              class="absolute -top-3 left-1/2 z-10 -translate-x-1/2"
            >
              <UiBadge
                variant="primary"
                size="md"
                class="inline-flex items-center gap-1 !rounded-full border border-[#4338CA]/20 bg-[#4338CA] px-3 py-1 text-[11px] uppercase tracking-wide !text-white shadow-sm"
              >
                <Star class="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                Mais escolhido
              </UiBadge>
            </div>

            <div v-if="plansByTier.get(tier)" class="flex flex-1 flex-col p-6 sm:p-7">
              <div class="mb-4 flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <h2 class="text-xl font-bold text-slate-900">
                    {{ plansByTier.get(tier)!.name }}
                  </h2>
                  <p class="mt-1 text-xs leading-snug text-slate-500">
                    {{ PLAN_TIER_SUBTITLES[tier] }}
                  </p>
                </div>
                <UiBadge v-if="isActivePlanTier(tier)" variant="success" size="md">
                  Ativo
                </UiBadge>
                <UiBadge
                  v-else-if="selectedTier === tier"
                  variant="primary"
                  size="md"
                  class="shrink-0"
                >
                  Selecionado
                </UiBadge>
              </div>

              <div class="mb-5 border-b border-slate-100 pb-5">
                <div class="flex flex-wrap items-baseline gap-x-1 gap-y-0.5">
                  <span class="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                    {{ priceBlock(plansByTier.get(tier)!).main }}
                  </span>
                  <span class="text-sm font-medium text-slate-500">
                    {{ priceBlock(plansByTier.get(tier)!).suffix }}
                  </span>
                </div>
                <p
                  v-if="priceBlock(plansByTier.get(tier)!).sub"
                  class="mt-2 text-xs leading-snug text-slate-500"
                >
                  {{ priceBlock(plansByTier.get(tier)!).sub }}
                </p>
              </div>

              <p class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Recursos inclusos:
              </p>
              <ul class="mb-6 flex-1 space-y-2.5 text-sm text-slate-700">
                <li
                  v-for="(feature, index) in PLAN_TIER_FEATURES[tier]"
                  :key="index"
                  class="flex items-start gap-2.5"
                >
                  <CheckCircle2
                    class="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#4338CA]"
                    aria-hidden="true"
                  />
                  <span v-html="feature.html" />
                </li>
              </ul>

              <UiButton
                type="button"
                class="w-full"
                :variant="selectedTier === tier ? 'primary' : 'outline'"
                size="lg"
                @click="selectTier(tier)"
              >
                <Check v-if="selectedTier === tier" class="h-4 w-4 shrink-0" aria-hidden="true" />
                {{
                  selectedTier === tier
                    ? `Plano selecionado: ${plansByTier.get(tier)?.name ?? ''}`
                    : `Escolher ${plansByTier.get(tier)?.name ?? ''}`
                }}
              </UiButton>
            </div>
          </UiCard>
        </div>

        <div class="mx-auto mt-10 max-w-4xl space-y-6">
          <div
            class="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-600"
          >
            <Info class="mt-0.5 h-5 w-5 shrink-0 text-[#4338CA]" aria-hidden="true" />
            <p>
              <strong class="text-slate-900">Excedente:</strong> {{ overagePriceLabel }} por
              mensagem além da franquia do plano.
              <template v-if="marketingSeparateCopy"> {{ marketingSeparateCopy }}</template>
              Mensagens adicionais são cobradas por excedente ou diretamente pela Meta Cloud API
              conforme tabela oficial de conversação. Na modalidade
              <em>Pague a Meta direto</em>, você paga a assinatura Rappeli aqui e as conversas
              WhatsApp são cobradas pela Meta diretamente no cartão cadastrado na Meta (Essencial R$
              197, Profissional R$ 397, Escala R$ 797/mês; anual R$ 1.970, R$ 3.970, R$ 7.970).
              <template v-if="catalog?.agents_limit == null">
                Todos os planos incluem usuários ilimitados (sem limite de atendentes).
              </template>
            </p>
          </div>
          <div
            class="flex flex-col items-center justify-around gap-4 rounded-xl border border-slate-200 bg-white px-6 py-4 text-center text-sm text-slate-700 md:flex-row"
          >
            <span class="inline-flex items-center gap-2">
              <Check class="h-4 w-4 text-[#4338CA]" aria-hidden="true" />
              Implantação inclusa, sem taxa
            </span>
            <span class="hidden h-5 w-px bg-slate-200 md:block" aria-hidden="true" />
            <span class="inline-flex items-center gap-2">
              <LockOpen class="h-4 w-4 text-[#4338CA]" aria-hidden="true" />
              Sem fidelidade
            </span>
            <span class="hidden h-5 w-px bg-slate-200 md:block" aria-hidden="true" />
            <span class="inline-flex items-center gap-2">
              <UserRound class="h-4 w-4 text-[#4338CA]" aria-hidden="true" />
              Suporte humano em português
            </span>
          </div>
        </div>
      </template>
    </div>

    <template #action-bar>
      <OnboardingActionBar
        v-if="!loading && !error"
        summary-layout="v5"
        :show-back="false"
        :primary-label="actionPrimaryLabel"
        :primary-disabled="actionPrimaryDisabled"
        :primary-loading="planChangeLoading"
        @primary="continueToPayment"
      >
        <template #summary>
          <div v-if="selectedSummaryV5" class="min-w-0">
            <span class="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Resumo da seleção
            </span>
            <span class="mt-0.5 block text-sm font-semibold text-slate-900 sm:text-base">
              {{ selectedSummaryV5 }}
            </span>
            <span class="mt-0.5 block text-xs text-slate-500 sm:hidden">
              {{ selectedSummary }}
            </span>
          </div>
        </template>
      </OnboardingActionBar>
    </template>
  </OnboardingShell>

  <AppConfirmModal
    :open="planChangeConfirmOpen"
    title="Confirmar alteração de plano"
    :message="planChangeConfirmMessage"
    confirm-label="Confirmar alteração"
    cancel-label="Voltar"
    variant="primary"
    :loading="planChangeLoading"
    @close="closePlanChangeConfirm"
    @confirm="confirmPlanChange"
  />
</template>
