<script setup lang="ts">
import { AlertCircle, Building2, CheckCircle2, CreditCard, MessageCircle, RefreshCw, ShieldCheck } from '@lucide/vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import { checkoutSubscription } from '@/api/billing'
import BillingCheckoutForms from '@/components/billing/BillingCheckoutForms.vue'
import OnboardingActionBar from '@/components/onboarding/OnboardingActionBar.vue'
import OnboardingShell from '@/components/onboarding/OnboardingShell.vue'
import { UiBadge, UiCard, UiInput } from '@/components/ui'
import { PLAN_TIER_FEATURES, WHATSAPP_HELP_URL, type PlanTierId } from '@/constants/onboardingPlans'
import { useAuthStore } from '@/stores/auth'
import { useCheckoutFlowStore } from '@/stores/checkoutFlow'
import { maskCpfCnpj } from '@/utils/brazilianDocument'
import {
  billingCycleLabel,
  formatBillingCurrency,
  maskPhoneBr,
  maskPostalCode,
} from '@/utils/billingFormat'
import { emptyCheckoutForms, validateCheckoutForms } from '@/utils/billingCheckoutValidation'
import { resolveCheckoutSubmitError } from '@/utils/billingCheckoutSubmitError'
import {
  CHECKOUT_PAYMENT_REFUSED_HINT,
  isCheckoutPaymentFailureResult,
} from '@/utils/billingCheckoutPaymentRefused'

const router = useRouter()
const auth = useAuthStore()
const checkoutFlow = useCheckoutFlowStore()

const submitting = ref(false)
const formError = ref<string | null>(null)
const paymentRefusedActive = ref(false)
const fieldErrors = ref<Record<string, string>>({})
const authorizeRecurring = ref(true)
const legalName = ref('')
const streetAddress = ref('')

const forms = reactive(emptyCheckoutForms())

const planSummary = computed(() => ({
  name: checkoutFlow.planName,
  modalityLabel: checkoutFlow.modalityLabel,
  cycle: checkoutFlow.cycle,
  amount: checkoutFlow.amount,
}))

const planTierFeatures = computed(() => {
  const tier = checkoutFlow.tier
  if (tier === 'essencial' || tier === 'profissional' || tier === 'escala') {
    return PLAN_TIER_FEATURES[tier as PlanTierId]
  }
  return []
})

const planLineLabel = computed(() =>
  planSummary.value.cycle === 'YEARLY' ? 'Plano anual' : 'Plano mensal',
)

const totalCycleHint = computed(() => {
  if (planSummary.value.cycle === 'MONTHLY') {
    return 'Cobrado mensalmente'
  }
  if (planSummary.value.cycle === 'YEARLY') {
    return 'Cobrado anualmente'
  }
  return null
})

const termsUrl = 'https://rappeli.com.br/termos'
const privacyUrl = 'https://rappeli.com.br/privacidade'

onMounted(() => {
  if (!checkoutFlow.planId) {
    void router.replace({ name: 'assinatura-planos' })
    return
  }

  if (auth.user) {
    forms.holder.name = auth.user.name
    forms.holder.email = auth.user.email
  }
  if (checkoutFlow.whatsapp) {
    forms.holder.phone = checkoutFlow.whatsapp
  }
  if (checkoutFlow.companyName) {
    legalName.value = checkoutFlow.companyName
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
  if (!authorizeRecurring.value) {
    formError.value = 'Autorize a cobrança recorrente para continuar.'
    paymentRefusedActive.value = false
    return
  }
  if (Object.keys(fieldErrors.value).length > 0) {
    paymentRefusedActive.value = false
    return
  }

  submitting.value = true
  try {
    await checkoutSubscription({
      modality: checkoutFlow.modality,
      tier: checkoutFlow.tier,
      cycle: checkoutFlow.cycle,
      holder: { ...forms.holder },
      credit_card: { ...forms.creditCard },
    })
    clearCardState()
    paymentRefusedActive.value = false
    void router.push({ name: 'assinatura-ativacao' })
  } catch (error) {
    const resolved = resolveCheckoutSubmitError(error)
    paymentRefusedActive.value = isCheckoutPaymentFailureResult(resolved)
    if (resolved.kind === 'validation') {
      fieldErrors.value = resolved.fieldErrors
      formError.value = resolved.alertMessage ?? null
      return
    }
    formError.value = resolved.message
  } finally {
    submitting.value = false
  }
}

function billingFieldError(field: string): string | undefined {
  return fieldErrors.value[field]
}

function goBack(): void {
  void router.push({ name: 'assinatura-planos' })
}

function onPhoneInput(value: string): void {
  forms.holder.phone = maskPhoneBr(value)
}
</script>

<template>
  <OnboardingShell :step="3" shell-variant="cadastro-v5" reserve-action-bar-space @back="goBack">
    <div class="onboarding-action-bar-scroll mx-auto w-full max-w-[1080px]">
      <header class="mb-8">
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Finalizar contratação
        </h1>
        <p class="mt-2 text-sm leading-relaxed text-slate-500 sm:text-base">
          Ambiente seguro com criptografia de ponta a ponta. Ativação imediata do seu workspace.
        </p>
      </header>

      <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
        <div class="space-y-6 lg:col-span-7">
          <UiCard padding="none" class="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
            <div class="border-b border-slate-200 px-6 py-4">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="flex items-center gap-2">
                  <div
                    class="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-50 text-[#4338CA]"
                  >
                    <Building2 class="h-3.5 w-3.5" aria-hidden="true" />
                  </div>
                  <h2 class="text-base font-semibold text-slate-900">Dados de faturamento</h2>
                </div>
                <span class="text-xs text-slate-500">Nota fiscal emitida automaticamente</span>
              </div>
            </div>

            <div class="space-y-4 p-6">
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-12">
                <div class="space-y-1.5 sm:col-span-6">
                  <label for="bill-name" class="text-xs font-medium text-slate-700">
                    Nome completo
                  </label>
                  <UiInput
                    id="bill-name"
                    v-model="forms.holder.name"
                    type="text"
                    placeholder="Nome do responsável"
                    autocomplete="name"
                    :invalid="Boolean(billingFieldError('holder.name'))"
                  />
                  <p v-if="billingFieldError('holder.name')" class="text-xs text-red-600">
                    {{ billingFieldError('holder.name') }}
                  </p>
                </div>
                <div class="space-y-1.5 sm:col-span-6">
                  <label for="bill-email" class="text-xs font-medium text-slate-700"> E-mail </label>
                  <UiInput
                    id="bill-email"
                    v-model="forms.holder.email"
                    type="email"
                    placeholder="nome@empresa.com.br"
                    autocomplete="email"
                    :invalid="Boolean(billingFieldError('holder.email'))"
                  />
                  <p v-if="billingFieldError('holder.email')" class="text-xs text-red-600">
                    {{ billingFieldError('holder.email') }}
                  </p>
                </div>
                <div class="space-y-1.5 sm:col-span-6">
                  <label for="bill-phone" class="text-xs font-medium text-slate-700">
                    WhatsApp
                  </label>
                  <UiInput
                    id="bill-phone"
                    :model-value="forms.holder.phone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    autocomplete="tel"
                    inputmode="tel"
                    :invalid="Boolean(billingFieldError('holder.phone'))"
                    @update:model-value="onPhoneInput"
                  />
                  <p v-if="billingFieldError('holder.phone')" class="text-xs text-red-600">
                    {{ billingFieldError('holder.phone') }}
                  </p>
                </div>
                <div class="space-y-1.5 sm:col-span-6">
                  <label for="bill-doc" class="text-xs font-medium text-slate-700">
                    CPF ou CNPJ
                  </label>
                  <UiInput
                    id="bill-doc"
                    :model-value="forms.holder.cpf_cnpj"
                    type="text"
                    placeholder="Ex.: 000.000.000-00"
                    inputmode="numeric"
                    :invalid="Boolean(billingFieldError('holder.cpf_cnpj'))"
                    @update:model-value="(v) => (forms.holder.cpf_cnpj = maskCpfCnpj(v))"
                  />
                  <p v-if="billingFieldError('holder.cpf_cnpj')" class="text-xs text-red-600">
                    {{ billingFieldError('holder.cpf_cnpj') }}
                  </p>
                </div>
                <div class="space-y-1.5 sm:col-span-12">
                  <label for="legal-name" class="text-xs font-medium text-slate-700">
                    Razão social
                  </label>
                  <UiInput
                    id="legal-name"
                    v-model="legalName"
                    type="text"
                    placeholder="Razão social ou nome fantasia"
                  />
                </div>
                <div class="space-y-1.5 sm:col-span-4">
                  <label for="cep" class="text-xs font-medium text-slate-700"> CEP </label>
                  <UiInput
                    id="cep"
                    :model-value="forms.holder.postal_code"
                    type="text"
                    placeholder="Ex.: 00000-000"
                    inputmode="numeric"
                    autocomplete="postal-code"
                    :invalid="Boolean(billingFieldError('holder.postal_code'))"
                    @update:model-value="(v) => (forms.holder.postal_code = maskPostalCode(v))"
                  />
                  <p v-if="billingFieldError('holder.postal_code')" class="text-xs text-red-600">
                    {{ billingFieldError('holder.postal_code') }}
                  </p>
                </div>
                <div class="space-y-1.5 sm:col-span-5">
                  <label for="street" class="text-xs font-medium text-slate-700"> Endereço </label>
                  <UiInput
                    id="street"
                    v-model="streetAddress"
                    type="text"
                    placeholder="Rua, avenida ou logradouro"
                  />
                </div>
                <div class="space-y-1.5 sm:col-span-3">
                  <label for="number" class="text-xs font-medium text-slate-700"> Número </label>
                  <UiInput
                    id="number"
                    v-model="forms.holder.address_number"
                    type="text"
                    placeholder="Número"
                    :invalid="Boolean(billingFieldError('holder.address_number'))"
                  />
                  <p v-if="billingFieldError('holder.address_number')" class="text-xs text-red-600">
                    {{ billingFieldError('holder.address_number') }}
                  </p>
                </div>
              </div>
            </div>
          </UiCard>

          <UiCard padding="none" class="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
            <div class="border-b border-slate-200 px-6 py-4">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="flex items-center gap-2">
                  <div
                    class="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-50 text-[#4338CA]"
                  >
                    <CreditCard class="h-3.5 w-3.5" aria-hidden="true" />
                  </div>
                  <h2 class="text-base font-semibold text-slate-900">Cartão de crédito</h2>
                </div>
                <div class="flex items-center gap-2 text-[10px] font-bold tracking-wide text-slate-400">
                  <span class="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5">VISA</span>
                  <span class="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 lowercase">
                    mastercard
                  </span>
                  <span class="rounded border border-slate-200 bg-slate-50 px-2 py-0.5">elo</span>
                </div>
              </div>
            </div>

            <div class="p-6">
              <div
                v-if="paymentRefusedActive && formError"
                class="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3.5"
                role="alert"
              >
                <AlertCircle
                  class="mt-0.5 h-5 w-5 shrink-0 text-red-600"
                  aria-hidden="true"
                />
                <div>
                  <h3 class="text-sm font-bold text-red-900">{{ formError }}</h3>
                  <p class="mt-0.5 text-xs text-red-600">
                    {{ CHECKOUT_PAYMENT_REFUSED_HINT }}
                  </p>
                </div>
              </div>

              <BillingCheckoutForms
                v-model:holder="forms.holder"
                v-model:credit-card="forms.creditCard"
                :field-errors="fieldErrors"
                :disabled="submitting"
                :card-payment-refused-highlight="paymentRefusedActive"
                billing-only
                ui-variant="v5"
              />

              <div
                class="mt-4 flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-600"
              >
                <ShieldCheck class="mt-0.5 h-4 w-4 shrink-0 text-[#4338CA]" aria-hidden="true" />
                <span>
                  Pagamento processado pelo Asaas; não armazenamos os dados do seu cartão.
                </span>
              </div>

              <label class="mt-4 flex cursor-pointer items-start gap-3 text-sm text-slate-600">
                <input
                  v-model="authorizeRecurring"
                  type="checkbox"
                  class="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#4338CA] focus:ring-[#4338CA]/20"
                />
                Autorizo a cobrança recorrente no cartão a cada renovação do plano.
              </label>

              <div v-if="paymentRefusedActive" class="mt-4 space-y-2.5">
                <button
                  type="button"
                  class="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#4338CA] text-sm font-medium text-white shadow-sm transition hover:bg-[#3730A3] disabled:opacity-60"
                  :disabled="submitting"
                  @click="onSubmit"
                >
                  <span>{{ submitting ? 'Aguarde…' : 'Tentar outro cartão' }}</span>
                  <RefreshCw class="h-4 w-4" aria-hidden="true" />
                </button>
                <a
                  :href="WHATSAPP_HELP_URL"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <MessageCircle class="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  <span>Ajuda no WhatsApp</span>
                </a>
                <p class="mt-2.5 text-center text-[11px] text-slate-500">
                  Ao confirmar, você concorda com nossos
                  <a
                    :href="termsUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="font-semibold text-[#4338CA] hover:underline"
                    >Termos de Uso</a
                  >
                  e
                  <a
                    :href="privacyUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="font-semibold text-[#4338CA] hover:underline"
                    >Política de Privacidade</a
                  >.
                </p>
              </div>
            </div>
          </UiCard>

          <p
            v-if="formError && !paymentRefusedActive"
            class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {{ formError }}
          </p>
        </div>

        <aside class="lg:col-span-5 lg:sticky lg:top-24">
          <UiCard padding="none" class="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
            <div
              class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-6 py-4"
            >
              <h2 class="text-base font-semibold text-slate-900">Resumo do pedido</h2>
              <UiBadge
                variant="success"
                size="md"
                class="!rounded-md border border-emerald-200 bg-emerald-50 !text-[11px] font-medium text-emerald-700"
              >
                Ativação Imediata
              </UiBadge>
            </div>

            <div class="space-y-3 border-b border-slate-200 px-6 py-4">
              <p v-if="planSummary.name" class="text-sm font-semibold text-slate-900">
                Plano {{ planSummary.name
                }}<template v-if="planSummary.modalityLabel">
                  — {{ planSummary.modalityLabel }}</template
                >
              </p>
              <p v-if="planSummary.cycle" class="text-xs text-slate-500">
                Ciclo: {{ billingCycleLabel(planSummary.cycle) }}
                <template v-if="planSummary.cycle === 'YEARLY'"> (renova a cada 12 meses)</template>
              </p>

              <ul v-if="planTierFeatures.length" class="space-y-1.5 pt-1 text-xs text-slate-500">
                <li
                  v-for="(feature, index) in planTierFeatures"
                  :key="index"
                  class="flex items-start gap-2"
                >
                  <CheckCircle2
                    class="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500"
                    aria-hidden="true"
                  />
                  <span v-html="feature.html" />
                </li>
              </ul>
            </div>

            <div class="space-y-2.5 border-b border-slate-200 px-6 py-4 text-xs text-slate-700">
              <div class="flex justify-between">
                <span>{{ planLineLabel }}</span>
                <span v-if="planSummary.amount != null" class="font-medium text-slate-900">
                  {{ formatBillingCurrency(planSummary.amount) }}
                </span>
              </div>
              <div class="flex justify-between text-emerald-600">
                <span>Taxa de implantação</span>
                <span class="font-medium">Grátis</span>
              </div>
            </div>

            <div class="border-b border-slate-200 px-6 py-4">
              <div class="flex items-end justify-between gap-4">
                <span class="text-sm font-semibold text-slate-900">Total hoje</span>
                <div class="text-right">
                  <span v-if="planSummary.amount != null" class="text-2xl font-bold text-[#4338CA]">
                    {{ formatBillingCurrency(planSummary.amount) }}
                  </span>
                  <span v-if="totalCycleHint" class="mt-0.5 block text-[11px] text-slate-500">
                    {{ totalCycleHint }}
                  </span>
                </div>
              </div>
              <p class="mt-3 text-xs leading-relaxed text-slate-500">
                Cobrança à vista no cartão. Sem taxa de implantação, sem fidelidade, cancele quando
                quiser em 1 clique.
              </p>
            </div>

            <div class="px-6 py-4">
              <p
                class="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 border-b border-slate-100 pb-3 text-center text-xs text-slate-500"
              >
                <span class="inline-flex items-center gap-1.5">
                  <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                  Sem fidelidade
                </span>
                <span class="text-slate-300" aria-hidden="true">·</span>
                <span>Sem taxa de adesão</span>
                <span class="text-slate-300" aria-hidden="true">·</span>
                <span>Cancele em 1 clique</span>
              </p>
              <div class="mt-3 text-center">
                <RouterLink
                  :to="{ name: 'assinatura-planos' }"
                  class="text-xs font-semibold text-[#4338CA] hover:underline"
                >
                  Alterar plano
                </RouterLink>
              </div>
            </div>
          </UiCard>
        </aside>
      </div>
    </div>

    <template v-if="!paymentRefusedActive" #action-bar>
      <OnboardingActionBar
        summary-layout="v5"
        :show-back="false"
        primary-label="Confirmar pagamento"
        :primary-loading="submitting"
        @back="goBack"
        @primary="onSubmit"
      >
        <template #summary>
          <div v-if="planSummary.name" class="min-w-0">
            <span class="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Resumo da seleção
            </span>
            <span class="mt-0.5 block text-sm font-semibold text-slate-900 sm:text-base">
              Plano {{ planSummary.name
              }}<template v-if="planSummary.modalityLabel">
                — {{ planSummary.modalityLabel }}</template
              >
            </span>
            <span v-if="planSummary.amount != null" class="mt-0.5 block text-xs text-slate-500">
              Total hoje: {{ formatBillingCurrency(planSummary.amount) }}
            </span>
          </div>
        </template>
      </OnboardingActionBar>
    </template>
  </OnboardingShell>
</template>
