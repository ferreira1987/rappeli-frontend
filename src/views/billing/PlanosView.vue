<script setup lang="ts">
import { Check } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import { changeSubscriptionPlan, fetchBillingPlans, fetchCurrentSubscription } from '@/api/billing'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import type { BillingCycle, BillingModality, BillingPlanItem, BillingPlansResponse } from '@/types/billing'
import { billingCycleLabel, formatBillingCurrency } from '@/utils/billingFormat'
import { getErrorMessage } from '@/utils/errors'

const router = useRouter()

const loading = ref(true)
const error = ref<string | null>(null)
const catalog = ref<BillingPlansResponse | null>(null)
const cycle = ref<BillingCycle>('MONTHLY')
const modality = ref<BillingModality>('meta_direct')
const changingPlanId = ref<string | null>(null)
const planChangeMessage = ref<string | null>(null)
const hasActiveSubscription = ref(false)

const tierOrder = ['essencial', 'profissional', 'escala'] as const

const tierTaglines: Record<string, string> = {
  essencial: 'Para equipes que estão organizando o atendimento.',
  profissional: 'Para operações com volume recorrente de conversas.',
  escala: 'Para times que precisam de mais capacidade no dia a dia.',
}

const modalities = computed(() => {
  if (!catalog.value) {
    return [] as { id: BillingModality; label: string }[]
  }
  return (['meta_direct', 'included'] as BillingModality[]).map((id) => ({
    id,
    label: catalog.value!.modes[id]?.label ?? id,
  }))
})

const visiblePlans = computed((): BillingPlanItem[] => {
  if (!catalog.value) {
    return []
  }
  const modePlans = catalog.value.modes[modality.value]?.plans ?? []
  return modePlans
    .filter((plan) => plan.cycle === cycle.value)
    .sort((a, b) => tierOrder.indexOf(a.tier as typeof tierOrder[number]) - tierOrder.indexOf(b.tier as typeof tierOrder[number]))
})

const sharedBenefits = computed(() => catalog.value?.shared_benefits ?? [])

onMounted(async () => {
  try {
    const [plans, current] = await Promise.all([fetchBillingPlans(), fetchCurrentSubscription()])
    catalog.value = plans
    hasActiveSubscription.value = current != null && current.status === 'ACTIVE'
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
})

async function selectPlan(plan: BillingPlanItem): Promise<void> {
  if (hasActiveSubscription.value) {
    changingPlanId.value = plan.id
    planChangeMessage.value = null
    error.value = null
    try {
      await changeSubscriptionPlan({ plan: plan.id })
      planChangeMessage.value = 'Plano atualizado com sucesso.'
      void router.push({ name: 'minha-assinatura' })
    } catch (err) {
      error.value = getErrorMessage(err)
    } finally {
      changingPlanId.value = null
    }
    return
  }

  void router.push({
    name: 'assinatura-checkout',
    query: {
      modality: modality.value,
      tier: plan.tier,
      cycle: plan.cycle,
    },
  })
}
</script>

<template>
  <div class="min-h-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
    <header class="max-w-4xl">
      <h1 class="font-display text-2xl font-semibold text-brand-ink">Planos</h1>
      <p class="mt-1 text-sm text-brand-gray">
        Escolha a modalidade e o plano que fazem sentido para sua operação. Cobrança recorrente no cartão de
        crédito.
      </p>
    </header>

    <div v-if="loading" class="mt-10 text-sm text-brand-gray">Carregando planos…</div>
    <p
      v-if="planChangeMessage"
      class="mt-10 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
    >
      {{ planChangeMessage }}
    </p>
    <p v-else-if="error" class="mt-10 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {{ error }}
    </p>

    <template v-else-if="catalog">
      <div class="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div
          class="inline-flex rounded-xl border border-slate-200 bg-white p-1 text-sm font-medium"
          role="tablist"
          aria-label="Modalidade"
        >
          <button
            v-for="mode in modalities"
            :key="mode.id"
            type="button"
            role="tab"
            class="rounded-lg px-4 py-2 transition"
            :class="
              modality === mode.id
                ? 'bg-brand-mist text-brand-indigo'
                : 'text-brand-gray hover:text-brand-ink'
            "
            :aria-selected="modality === mode.id"
            @click="modality = mode.id"
          >
            {{ mode.label }}
          </button>
        </div>

        <div
          class="inline-flex rounded-xl border border-slate-200 bg-white p-1 text-sm font-medium"
          role="group"
          aria-label="Periodicidade"
        >
          <button
            type="button"
            class="rounded-lg px-4 py-2 transition"
            :class="cycle === 'MONTHLY' ? 'bg-brand-mist text-brand-indigo' : 'text-brand-gray'"
            @click="cycle = 'MONTHLY'"
          >
            Mensal
          </button>
          <button
            type="button"
            class="rounded-lg px-4 py-2 transition"
            :class="cycle === 'YEARLY' ? 'bg-brand-mist text-brand-indigo' : 'text-brand-gray'"
            @click="cycle = 'YEARLY'"
          >
            Anual
          </button>
        </div>
      </div>

      <ul v-if="sharedBenefits.length" class="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm text-brand-gray">
        <li v-for="benefit in sharedBenefits" :key="benefit" class="inline-flex items-center gap-1.5">
          <Check class="h-4 w-4 text-brand-indigo" aria-hidden="true" />
          {{ benefit }}
        </li>
      </ul>

      <div class="mt-8 grid gap-6 lg:grid-cols-3">
        <article
          v-for="plan in visiblePlans"
          :key="plan.id"
          class="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
        >
          <p class="text-xs font-semibold uppercase tracking-wide text-brand-gray">{{ plan.name }}</p>
          <p class="mt-2 text-sm text-brand-gray">{{ tierTaglines[plan.tier] ?? '' }}</p>
          <p class="mt-6 font-display text-3xl font-semibold text-brand-ink">
            {{ formatBillingCurrency(plan.amount) }}
            <span class="text-sm font-normal text-brand-gray">/ {{ billingCycleLabel(plan.cycle).toLowerCase() }}</span>
          </p>
          <button
            type="button"
            class="mt-8 w-full rounded-xl bg-brand-indigo px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-indigo/90 disabled:opacity-60"
            :disabled="changingPlanId != null"
            @click="selectPlan(plan)"
          >
            {{ hasActiveSubscription ? 'Mudar para este plano' : 'Assinar' }}
          </button>
        </article>
      </div>

      <p class="mt-8 text-sm text-brand-gray">
        Já tem assinatura?
        <RouterLink :to="{ name: 'minha-assinatura' }" class="font-medium text-brand-indigo hover:underline">
          Ver minha assinatura
        </RouterLink>
      </p>
    </template>

    <AppPageFooter class="mt-12" />
  </div>
</template>
