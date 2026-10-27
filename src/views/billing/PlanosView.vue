<script setup lang="ts">
import { Check, CheckCircle2, Info, LockOpen, PiggyBank, Star, UserRound } from '@lucide/vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'


import { fetchBillingPlans, fetchCurrentSubscription } from '@/api/billing'
import OnboardingActionBar from '@/components/onboarding/OnboardingActionBar.vue'
import OnboardingShell from '@/components/onboarding/OnboardingShell.vue'
import {
  PLAN_TIER_FEATURES,
  PLAN_TIER_SUBTITLES,
  type PlanTierId,
} from '@/constants/onboardingPlans'
import { useCheckoutFlowStore } from '@/stores/checkoutFlow'
import type { BillingCycle, BillingModality, BillingPlanItem, BillingPlansResponse } from '@/types/billing'
import { formatPlanAmountCompact } from '@/utils/billingFormat'
import { getErrorMessage } from '@/utils/errors'

const router = useRouter()
const checkoutFlow = useCheckoutFlowStore()
const activeSubscriptionTier = ref<string | null>(null)

const loading = ref(true)
const error = ref<string | null>(null)
const catalog = ref<BillingPlansResponse | null>(null)

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

const selectedSummary = computed(() => {
  if (!selectedPlan.value) {
    return ''
  }
  const amount = formatPlanAmountCompact(selectedPlan.value.amount)
  const cycleLabel = cycle.value === 'YEARLY' ? 'Anual' : 'Mensal'
  return `${selectedPlan.value.name} (${cycleLabel} ${amount})`
})

watch([modality, cycle], () => {
  if (!plansByTier.value.has(selectedTier.value)) {
    const first = tierOrder.find((tier) => plansByTier.value.has(tier))
    if (first) {
      selectedTier.value = first
    }
  }
})

onMounted(async () => {
  try {
    catalog.value = await fetchBillingPlans()
    if (!plansByTier.value.has(selectedTier.value)) {
      selectedTier.value = 'profissional'
    }
    const subscription = await fetchCurrentSubscription()
    if (subscription?.status === 'ACTIVE') {
      activeSubscriptionTier.value = subscription.tier
      selectedTier.value = subscription.tier
    }
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
})

function isActivePlanTier(tier: string): boolean {
  return activeSubscriptionTier.value != null && activeSubscriptionTier.value === tier
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

function goBack(): void {
  void router.push({ name: 'cadastro' })
}
</script>

<template>
  <OnboardingShell :step="2" wide>
    <div class="text-center">
      <h1 class="text-2xl font-extrabold tracking-tight text-brand-ink md:text-[28px]">
        Escolha o plano ideal para a sua operação
      </h1>
      <p class="mt-2 text-sm text-brand-gray">
        Sem taxa de implantação, sem fidelidade. Cancele quando quiser em 1 clique.
      </p>
    </div>

    <p v-if="loading" class="mt-10 text-center text-sm text-brand-gray">Carregando planos…</p>
    <p
      v-else-if="error"
      class="mt-10 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-800"
    >
      {{ error }}
    </p>

    <template v-else-if="catalog">
      <div class="mt-8 flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8">
        <div class="flex rounded-xl border border-slate-200 bg-brand-mist/40 p-1">
          <button
            v-for="mode in modalities"
            :key="mode.id"
            type="button"
            class="rounded-lg px-4 py-2 text-sm font-semibold transition"
            :class="
              modality === mode.id
                ? 'bg-brand-indigo text-white shadow-sm'
                : 'text-brand-gray hover:text-brand-ink'
            "
            @click="modality = mode.id"
          >
            {{ mode.label }}
          </button>
        </div>
        <div class="hidden h-6 w-px bg-slate-200 md:block" aria-hidden="true" />
        <div class="flex flex-wrap items-center justify-center gap-3">
          <div class="flex rounded-xl border border-slate-200 bg-brand-mist/40 p-1">
            <button
              type="button"
              class="rounded-lg px-3.5 py-1.5 text-sm font-medium transition"
              :class="cycle === 'MONTHLY' ? 'bg-white text-brand-indigo shadow-sm' : 'text-brand-gray'"
              @click="cycle = 'MONTHLY'"
            >
              Mensal
            </button>
            <button
              type="button"
              class="rounded-lg px-3.5 py-1.5 text-sm font-semibold transition"
              :class="cycle === 'YEARLY' ? 'bg-white text-brand-indigo shadow-sm' : 'text-brand-gray'"
              @click="cycle = 'YEARLY'"
            >
              Anual
            </button>
          </div>
          <span
            v-if="cycle === 'YEARLY'"
            class="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-orange-900"
          >
            <PiggyBank class="h-3.5 w-3.5" aria-hidden="true" />
            Economize ~17% (2 meses grátis)
          </span>
        </div>
      </div>

      <div class="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-7">
        <section
          v-for="tier in tierOrder"
          :key="tier"
          class="relative flex flex-col justify-between rounded-xl border bg-white p-6 shadow-sm transition"
          :class="
            selectedTier === tier
              ? 'border-2 border-brand-indigo shadow-lg ring-2 ring-brand-indigo/20'
              : 'border-slate-200'
          "
        >
          <div
            v-if="tier === 'profissional'"
            class="absolute -top-3.5 left-1/2 -translate-x-1/2"
          >
            <span
              class="inline-flex items-center gap-1 rounded-full bg-brand-indigo px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-sm"
            >
              <Star class="h-3.5 w-3.5 fill-current" aria-hidden="true" />
              Mais escolhido
            </span>
          </div>

          <div v-if="plansByTier.get(tier)">
            <div class="mb-4 mt-2">
              <h2
                class="flex items-center gap-2 text-xl font-bold"
                :class="selectedTier === tier ? 'text-brand-indigo' : 'text-brand-ink'"
              >
                {{ plansByTier.get(tier)!.name }}
                <span
                  v-if="isActivePlanTier(tier)"
                  class="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800"
                >
                  Ativo
                </span>
                <span
                  v-else-if="selectedTier === tier"
                  class="rounded-full bg-brand-mist px-2 py-0.5 text-xs font-semibold text-brand-indigo"
                >
                  Selecionado
                </span>
              </h2>
              <p class="mt-0.5 text-xs text-slate-500">{{ PLAN_TIER_SUBTITLES[tier] }}</p>
            </div>

            <div class="mb-5 border-b border-slate-100 pb-5">
              <div class="flex items-baseline gap-1">
                <span
                  class="text-3xl font-extrabold tracking-tight"
                  :class="selectedTier === tier ? 'text-brand-indigo' : 'text-brand-ink'"
                >
                  {{ priceBlock(plansByTier.get(tier)!).main }}
                </span>
                <span class="text-xs font-semibold text-slate-500">
                  {{ priceBlock(plansByTier.get(tier)!).suffix }}
                </span>
              </div>
              <p v-if="priceBlock(plansByTier.get(tier)!).sub" class="mt-1.5 text-xs leading-snug text-brand-gray">
                {{ priceBlock(plansByTier.get(tier)!).sub }}
              </p>
            </div>

            <ul class="mb-8 space-y-3 text-sm">
              <li
                v-for="(feature, index) in PLAN_TIER_FEATURES[tier]"
                :key="index"
                class="flex items-start gap-2.5"
              >
                <CheckCircle2
                  class="mt-0.5 h-[18px] w-[18px] shrink-0"
                  :class="selectedTier === tier ? 'text-brand-indigo' : 'text-emerald-700'"
                  aria-hidden="true"
                />
                <span v-html="feature.html" />
              </li>
            </ul>
          </div>

          <button
            type="button"
            class="w-full rounded-lg py-2.5 text-sm font-semibold transition"
            :class="
              selectedTier === tier
                ? 'flex items-center justify-center gap-1.5 bg-brand-indigo text-white shadow-sm'
                : 'border border-slate-300 bg-white text-brand-ink hover:bg-slate-50'
            "
            @click="selectTier(tier)"
          >
            <Check v-if="selectedTier === tier" class="h-4 w-4" aria-hidden="true" />
            {{
              selectedTier === tier
                ? `Plano Selecionado: ${plansByTier.get(tier)?.name ?? ''}`
                : `Escolher ${plansByTier.get(tier)?.name ?? ''}`
            }}
          </button>
        </section>
      </div>

      <div class="mx-auto mt-10 max-w-4xl space-y-6">
        <div class="flex items-start gap-3 rounded-xl border border-slate-200 bg-brand-mist/30 p-4 text-xs leading-relaxed text-brand-gray">
          <Info class="mt-0.5 h-5 w-5 shrink-0 text-brand-indigo" aria-hidden="true" />
          <p>
            <strong class="text-brand-ink">Excedente:</strong> R$ 0,05 por lembrete e R$ 0,39 por mensagem de
            marketing. Na modalidade <em>Pague a Meta direto</em> (Essencial R$ 197, Profissional R$ 397, Escala
            R$ 797/mês; anual R$ 1.970, R$ 3.970, R$ 7.970) as mensagens são cobradas pela Meta diretamente no
            seu cartão.
          </p>
        </div>
        <div
          class="flex flex-col items-center justify-around gap-4 rounded-xl border border-slate-200 bg-white px-6 py-4 text-center text-sm md:flex-row"
        >
          <span class="inline-flex items-center gap-2"><Check class="h-4 w-4 text-brand-indigo" /> Sem taxa de implantação</span>
          <span class="hidden h-5 w-px bg-slate-200 md:block" />
          <span class="inline-flex items-center gap-2"><LockOpen class="h-4 w-4 text-brand-indigo" /> Sem fidelidade</span>
          <span class="hidden h-5 w-px bg-slate-200 md:block" />
          <span class="inline-flex items-center gap-2"><UserRound class="h-4 w-4 text-brand-indigo" /> Suporte humano em português</span>
        </div>
      </div>
    </template>

    <template #action-bar>
      <OnboardingActionBar
        v-if="!loading && !error"
        primary-label="Continuar"
        :primary-disabled="!selectedPlan"
        @back="goBack"
        @primary="continueToPayment"
      >
        <template #summary>
          <div v-if="selectedSummary" class="hidden text-right sm:block">
            <span class="block text-xs text-slate-500">Plano selecionado</span>
            <span class="text-sm font-semibold text-brand-indigo">{{ selectedSummary }}</span>
          </div>
        </template>
      </OnboardingActionBar>
    </template>
  </OnboardingShell>
</template>
