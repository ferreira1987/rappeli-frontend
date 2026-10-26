<script setup lang="ts">
import { ArrowLeft, CheckCircle2, Loader2 } from '@lucide/vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { checkoutSubscription, fetchBillingPlans } from '@/api/billing'
import BillingCheckoutForms from '@/components/billing/BillingCheckoutForms.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import { useAuthStore } from '@/stores/auth'
import type { BillingCycle, BillingModality, BillingPlanItem } from '@/types/billing'
import { billingCycleLabel, formatBillingCurrency } from '@/utils/billingFormat'
import {
  emptyCheckoutForms,
  validateCheckoutForms,
} from '@/utils/billingCheckoutValidation'
import { getErrorMessage, getValidationErrors } from '@/utils/errors'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const loadingPlan = ref(true)
const submitting = ref(false)
const succeeded = ref(false)
const formError = ref<string | null>(null)
const fieldErrors = ref<Record<string, string>>({})
const selectedPlan = ref<BillingPlanItem | null>(null)
const modalityLabel = ref('')

const forms = reactive(emptyCheckoutForms())

const queryModality = computed(() => route.query.modality as BillingModality | undefined)
const queryTier = computed(() => (typeof route.query.tier === 'string' ? route.query.tier : undefined))
const queryCycle = computed(() => route.query.cycle as BillingCycle | undefined)

onMounted(async () => {
  if (!queryModality.value || !queryTier.value || !queryCycle.value) {
    await router.replace({ name: 'assinatura-planos' })
    return
  }

  if (auth.user) {
    forms.holder.name = auth.user.name
    forms.holder.email = auth.user.email
  }

  try {
    const catalog = await fetchBillingPlans()
    modalityLabel.value = catalog.modes[queryModality.value]?.label ?? ''
    const plan = catalog.modes[queryModality.value]?.plans.find(
      (item) => item.tier === queryTier.value && item.cycle === queryCycle.value,
    )
    if (!plan) {
      await router.replace({ name: 'assinatura-planos' })
      return
    }
    selectedPlan.value = plan
  } catch (error) {
    formError.value = getErrorMessage(error)
  } finally {
    loadingPlan.value = false
  }
})

function clearCardState(): void {
  forms.creditCard.number = ''
  forms.creditCard.cvv = ''
  forms.creditCard.expiry_month = ''
  forms.creditCard.expiry_year = ''
  forms.creditCard.holder_name = ''
}

async function onSubmit(): Promise<void> {
  formError.value = null
  fieldErrors.value = validateCheckoutForms(forms.holder, forms.creditCard)
  if (Object.keys(fieldErrors.value).length > 0) {
    return
  }

  if (!selectedPlan.value || !queryModality.value || !queryTier.value || !queryCycle.value) {
    return
  }

  submitting.value = true
  try {
    await checkoutSubscription({
      modality: queryModality.value,
      tier: queryTier.value,
      cycle: queryCycle.value,
      holder: { ...forms.holder },
      credit_card: { ...forms.creditCard },
    })
    clearCardState()
    succeeded.value = true
  } catch (error) {
    const validation = getValidationErrors(error)
    if (validation) {
      fieldErrors.value = validation
      return
    }
    formError.value = getErrorMessage(error)
  } finally {
    submitting.value = false
    clearCardState()
  }
}
</script>

<template>
  <div class="min-h-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
    <RouterLink
      :to="{ name: 'assinatura-planos' }"
      class="inline-flex items-center gap-2 text-sm font-medium text-brand-gray hover:text-brand-ink"
    >
      <ArrowLeft class="h-4 w-4" aria-hidden="true" />
      Voltar aos planos
    </RouterLink>

    <div v-if="succeeded" class="mx-auto mt-12 max-w-lg text-center">
      <CheckCircle2 class="mx-auto h-12 w-12 text-emerald-600" aria-hidden="true" />
      <h1 class="mt-4 font-display text-2xl font-semibold text-brand-ink">Assinatura confirmada</h1>
      <p class="mt-2 text-sm text-brand-gray">
        Seu pagamento foi processado. Você já pode usar o painel com o plano contratado.
      </p>
      <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <RouterLink
          :to="{ name: 'painel' }"
          class="rounded-xl bg-brand-indigo px-5 py-2.5 text-sm font-semibold text-white"
        >
          Ir para o painel
        </RouterLink>
        <RouterLink
          :to="{ name: 'minha-assinatura' }"
          class="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-brand-ink"
        >
          Minha assinatura
        </RouterLink>
      </div>
    </div>

    <template v-else>
      <header class="mt-6 max-w-3xl">
        <h1 class="font-display text-2xl font-semibold text-brand-ink">Finalizar assinatura</h1>
        <p class="mt-1 text-sm text-brand-gray">Revise o plano e informe os dados de cobrança.</p>
      </header>

      <div v-if="loadingPlan" class="mt-10 text-sm text-brand-gray">Carregando resumo…</div>

      <div v-else class="mt-8 grid gap-8 lg:grid-cols-3">
        <aside class="lg:col-span-1">
          <article
            v-if="selectedPlan"
            class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:sticky lg:top-6"
          >
            <p class="text-xs font-semibold uppercase tracking-wide text-brand-gray">Resumo</p>
            <h2 class="mt-2 font-display text-xl font-semibold text-brand-ink">{{ selectedPlan.name }}</h2>
            <p class="mt-1 text-sm text-brand-gray">{{ modalityLabel }}</p>
            <p class="mt-4 font-display text-2xl font-semibold text-brand-ink">
              {{ formatBillingCurrency(selectedPlan.amount) }}
              <span class="text-sm font-normal text-brand-gray">
                / {{ billingCycleLabel(selectedPlan.cycle).toLowerCase() }}
              </span>
            </p>
          </article>
        </aside>

        <form class="lg:col-span-2 space-y-6" @submit.prevent="onSubmit">
          <article class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <BillingCheckoutForms
              v-model:holder="forms.holder"
              v-model:credit-card="forms.creditCard"
              :field-errors="fieldErrors"
              :disabled="submitting"
            />
          </article>

          <p
            v-if="formError"
            class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {{ formError }}
          </p>

          <button
            type="submit"
            class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-indigo px-4 py-3 text-sm font-semibold text-white disabled:opacity-60 sm:w-auto"
            :disabled="submitting"
          >
            <Loader2 v-if="submitting" class="h-4 w-4 animate-spin" aria-hidden="true" />
            {{ submitting ? 'Processando…' : 'Confirmar pagamento' }}
          </button>
        </form>
      </div>
    </template>

    <AppPageFooter class="mt-12" />
  </div>
</template>
