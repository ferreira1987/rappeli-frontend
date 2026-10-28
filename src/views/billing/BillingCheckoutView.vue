<script setup lang="ts">
import { Building2, CreditCard, Lock } from '@lucide/vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import { checkoutSubscription } from '@/api/billing'
import BillingCheckoutForms from '@/components/billing/BillingCheckoutForms.vue'
import OnboardingActionBar from '@/components/onboarding/OnboardingActionBar.vue'
import OnboardingShell from '@/components/onboarding/OnboardingShell.vue'
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
import {
  resolveCheckoutSubmitError,
} from '@/utils/billingCheckoutSubmitError'

const router = useRouter()
const auth = useAuthStore()
const checkoutFlow = useCheckoutFlowStore()

const submitting = ref(false)
const formError = ref<string | null>(null)
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
    return
  }
  if (Object.keys(fieldErrors.value).length > 0) {
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
    void router.push({ name: 'assinatura-ativacao' })
  } catch (error) {
    const resolved = resolveCheckoutSubmitError(error)
    if (resolved.kind === 'validation') {
      fieldErrors.value = resolved.fieldErrors
      return
    }
    formError.value = resolved.message
  } finally {
    submitting.value = false
  }
}

function goBack(): void {
  void router.push({ name: 'assinatura-planos' })
}

function onDocInput(event: Event): void {
  forms.holder.cpf_cnpj = maskCpfCnpj((event.target as HTMLInputElement).value)
}

function onPhoneInput(event: Event): void {
  forms.holder.phone = maskPhoneBr((event.target as HTMLInputElement).value)
}

function onCepInput(event: Event): void {
  forms.holder.postal_code = maskPostalCode((event.target as HTMLInputElement).value)
}
</script>

<template>
  <OnboardingShell :step="3" wide>
    <div class="grid gap-8 lg:grid-cols-3">
      <div class="space-y-6 lg:col-span-2">
        <article class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="mb-4 flex items-center gap-2">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-mist text-brand-indigo"
            >
              <Building2 class="h-4 w-4" aria-hidden="true" />
            </div>
            <h2 class="text-lg font-semibold text-brand-ink">Dados de faturamento</h2>
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                class="text-[11px] font-semibold uppercase tracking-wide text-brand-gray"
                for="bill-name"
              >
                Nome completo
              </label>
              <input
                id="bill-name"
                v-model="forms.holder.name"
                type="text"
                placeholder="Nome do responsável"
                class="mt-1 h-[42px] w-full rounded-lg border border-slate-200 px-3 text-sm"
              />
            </div>
            <div>
              <label
                class="text-[11px] font-semibold uppercase tracking-wide text-brand-gray"
                for="bill-email"
              >
                E-mail
              </label>
              <input
                id="bill-email"
                v-model="forms.holder.email"
                type="email"
                placeholder="nome@empresa.com.br"
                class="mt-1 h-[42px] w-full rounded-lg border border-slate-200 px-3 text-sm"
              />
            </div>
            <div>
              <label
                class="text-[11px] font-semibold uppercase tracking-wide text-brand-gray"
                for="bill-phone"
              >
                WhatsApp
              </label>
              <input
                id="bill-phone"
                :value="forms.holder.phone"
                type="tel"
                placeholder="(00) 00000-0000"
                class="mt-1 h-[42px] w-full rounded-lg border border-slate-200 px-3 text-sm"
                @input="onPhoneInput"
              />
            </div>
            <div>
              <label
                class="text-[11px] font-semibold uppercase tracking-wide text-brand-gray"
                for="bill-doc"
              >
                CPF ou CNPJ
              </label>
              <input
                id="bill-doc"
                :value="forms.holder.cpf_cnpj"
                type="text"
                placeholder="00.000.000/0000-00"
                class="mt-1 h-[42px] w-full rounded-lg border border-slate-200 px-3 text-sm"
                @input="onDocInput"
              />
            </div>
            <div class="sm:col-span-2">
              <label
                class="text-[11px] font-semibold uppercase tracking-wide text-brand-gray"
                for="legal-name"
              >
                Razão social
              </label>
              <input
                id="legal-name"
                v-model="legalName"
                type="text"
                placeholder="Razão social ou nome fantasia"
                class="mt-1 h-[42px] w-full rounded-lg border border-slate-200 px-3 text-sm"
              />
            </div>
            <div>
              <label
                class="text-[11px] font-semibold uppercase tracking-wide text-brand-gray"
                for="cep"
              >
                CEP
              </label>
              <input
                id="cep"
                :value="forms.holder.postal_code"
                type="text"
                placeholder="00000-000"
                class="mt-1 h-[42px] w-full rounded-lg border border-slate-200 px-3 text-sm"
                @input="onCepInput"
              />
            </div>
            <div>
              <label
                class="text-[11px] font-semibold uppercase tracking-wide text-brand-gray"
                for="street"
              >
                Endereço
              </label>
              <input
                id="street"
                v-model="streetAddress"
                type="text"
                placeholder="Rua, avenida ou logradouro"
                class="mt-1 h-[42px] w-full rounded-lg border border-slate-200 px-3 text-sm"
              />
            </div>
            <div>
              <label
                class="text-[11px] font-semibold uppercase tracking-wide text-brand-gray"
                for="number"
              >
                Número
              </label>
              <input
                id="number"
                v-model="forms.holder.address_number"
                type="text"
                placeholder="Número"
                class="mt-1 h-[42px] w-full rounded-lg border border-slate-200 px-3 text-sm"
              />
            </div>
          </div>
        </article>

        <article class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="mb-4 flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-mist text-brand-indigo"
              >
                <CreditCard class="h-4 w-4" aria-hidden="true" />
              </div>
              <h2 class="text-lg font-semibold text-brand-ink">Cartão de crédito</h2>
            </div>
            <div class="flex gap-2 text-[10px] font-bold tracking-wide text-slate-400">
              <span>VISA</span>
              <span>mastercard</span>
              <span>elo</span>
            </div>
          </div>

          <BillingCheckoutForms
            v-model:holder="forms.holder"
            v-model:credit-card="forms.creditCard"
            :field-errors="fieldErrors"
            :disabled="submitting"
            billing-only
          />

          <p class="mt-3 flex items-center gap-2 text-xs text-brand-gray">
            <Lock class="h-3.5 w-3.5" aria-hidden="true" />
            Pagamento processado pelo Asaas; não armazenamos os dados do seu cartão.
          </p>

          <label class="mt-4 flex cursor-pointer items-start gap-2 text-sm text-brand-gray">
            <input
              v-model="authorizeRecurring"
              type="checkbox"
              class="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-indigo"
            />
            Autorizo a cobrança recorrente no cartão a cada renovação do plano.
          </label>
        </article>

        <p
          v-if="formError"
          class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {{ formError }}
        </p>
      </div>

      <aside class="lg:col-span-1">
        <article class="sticky top-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-brand-ink">Resumo do pedido</h2>
          <p class="mt-3 text-sm font-semibold text-brand-ink">
            Plano {{ planSummary.name }} — {{ planSummary.modalityLabel }}
          </p>
          <p class="mt-1 text-xs text-brand-gray">
            Ciclo: {{ billingCycleLabel(planSummary.cycle) }}
            <template v-if="planSummary.cycle === 'YEARLY'"> (renova a cada 12 meses)</template>
          </p>
          <div class="mt-4 flex justify-between text-sm">
            <span class="text-brand-gray">
              {{ planSummary.cycle === 'YEARLY' ? 'Plano anual' : 'Plano mensal' }}
            </span>
            <span>{{ formatBillingCurrency(planSummary.amount) }}</span>
          </div>
          <div class="mt-4 border-t border-slate-100 pt-4">
            <div class="flex items-end justify-between">
              <span class="text-sm font-semibold text-brand-ink">Total hoje</span>
              <span class="text-2xl font-bold text-brand-indigo">
                {{ formatBillingCurrency(planSummary.amount) }}
              </span>
            </div>
            <p class="mt-3 text-xs leading-relaxed text-brand-gray">
              Cobrança à vista no cartão. Sem taxa de implantação, sem fidelidade, cancele quando
              quiser em 1 clique.
            </p>
            <div class="mt-3 text-right">
              <RouterLink
                :to="{ name: 'assinatura-planos' }"
                class="text-xs font-semibold text-brand-indigo hover:underline"
              >
                Alterar plano
              </RouterLink>
            </div>
          </div>
        </article>
      </aside>
    </div>

    <template #action-bar>
      <OnboardingActionBar
        primary-label="Confirmar pagamento"
        :primary-loading="submitting"
        @back="goBack"
        @primary="onSubmit"
      />
    </template>
  </OnboardingShell>
</template>
