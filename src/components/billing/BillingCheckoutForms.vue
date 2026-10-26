<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import type { CheckoutCreditCardPayload, CheckoutHolderPayload } from '@/types/billing'
import { maskCpfCnpj } from '@/utils/brazilianDocument'
import { maskPostalCode, maskPhoneBr } from '@/utils/billingFormat'
import {
  cardBrandLabel,
  cvvMaxLength,
  detectCardBrand,
  maskCardNumber,
} from '@/utils/creditCard'

const props = defineProps<{
  holder: CheckoutHolderPayload
  creditCard: CheckoutCreditCardPayload
  fieldErrors: Record<string, string>
  disabled?: boolean
  billingOnly?: boolean
}>()

const emit = defineEmits<{
  'update:holder': [CheckoutHolderPayload]
  'update:creditCard': [CheckoutCreditCardPayload]
}>()

const cardBrand = computed(() => detectCardBrand(props.creditCard.number))

const expiryDisplay = ref('')

watch(
  () => [props.creditCard.expiry_month, props.creditCard.expiry_year] as const,
  ([month, year]) => {
    if (!month && !year) {
      expiryDisplay.value = ''
      return
    }
    const mm = month || ''
    const yy = year ? year.slice(-2) : ''
    expiryDisplay.value = yy ? `${mm}/${yy}` : mm
  },
  { immediate: true },
)

function inputClass(field: string): string {
  return props.fieldErrors[field]
    ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
    : 'border-slate-200 focus:border-brand-indigo focus:ring-brand-indigo'
}

function updateHolder(patch: Partial<CheckoutHolderPayload>): void {
  emit('update:holder', { ...props.holder, ...patch })
}

function updateCard(patch: Partial<CheckoutCreditCardPayload>): void {
  emit('update:creditCard', { ...props.creditCard, ...patch })
}

function onCpfCnpjInput(event: Event): void {
  const raw = (event.target as HTMLInputElement).value
  updateHolder({ cpf_cnpj: maskCpfCnpj(raw) })
}

function onPhoneInput(event: Event): void {
  const raw = (event.target as HTMLInputElement).value
  updateHolder({ phone: maskPhoneBr(raw) })
}

function onPostalCodeInput(event: Event): void {
  const raw = (event.target as HTMLInputElement).value
  updateHolder({ postal_code: maskPostalCode(raw) })
}

function onCardNumberInput(event: Event): void {
  const raw = (event.target as HTMLInputElement).value
  updateCard({ number: maskCardNumber(raw) })
}

function onExpiryInput(event: Event): void {
  const raw = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 6)
  expiryDisplay.value = raw.length <= 2 ? raw : `${raw.slice(0, 2)}/${raw.slice(2, 4)}`
  const month = raw.slice(0, 2)
  const yearPart = raw.slice(2, 4)
  const year = yearPart ? `20${yearPart}` : ''
  updateCard({ expiry_month: month, expiry_year: year })
}
</script>

<template>
  <div class="space-y-8">
    <section v-if="!billingOnly">
      <h2 class="text-lg font-semibold text-brand-ink">Titular da cobrança</h2>
      <div class="mt-4 grid gap-4 sm:grid-cols-2">
        <div class="sm:col-span-2">
          <label class="text-xs font-semibold uppercase tracking-wide text-brand-gray" for="holder-name">
            Nome completo
          </label>
          <input
            id="holder-name"
            type="text"
            autocomplete="name"
            class="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none ring-0 focus:ring-2"
            :class="inputClass('holder.name')"
            :value="holder.name"
            :disabled="disabled"
            @input="updateHolder({ name: ($event.target as HTMLInputElement).value })"
          />
          <p v-if="fieldErrors['holder.name']" class="mt-1 text-xs text-red-600">
            {{ fieldErrors['holder.name'] }}
          </p>
        </div>
        <div>
          <label class="text-xs font-semibold uppercase tracking-wide text-brand-gray" for="holder-doc">
            CPF ou CNPJ
          </label>
          <input
            id="holder-doc"
            type="text"
            inputmode="numeric"
            autocomplete="off"
            class="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none ring-0 focus:ring-2"
            :class="inputClass('holder.cpf_cnpj')"
            :value="holder.cpf_cnpj"
            :disabled="disabled"
            @input="onCpfCnpjInput"
          />
          <p v-if="fieldErrors['holder.cpf_cnpj']" class="mt-1 text-xs text-red-600">
            {{ fieldErrors['holder.cpf_cnpj'] }}
          </p>
        </div>
        <div>
          <label class="text-xs font-semibold uppercase tracking-wide text-brand-gray" for="holder-email">
            E-mail
          </label>
          <input
            id="holder-email"
            type="email"
            autocomplete="email"
            class="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none ring-0 focus:ring-2"
            :class="inputClass('holder.email')"
            :value="holder.email"
            :disabled="disabled"
            @input="updateHolder({ email: ($event.target as HTMLInputElement).value })"
          />
          <p v-if="fieldErrors['holder.email']" class="mt-1 text-xs text-red-600">
            {{ fieldErrors['holder.email'] }}
          </p>
        </div>
        <div>
          <label class="text-xs font-semibold uppercase tracking-wide text-brand-gray" for="holder-phone">
            Telefone
          </label>
          <input
            id="holder-phone"
            type="tel"
            inputmode="tel"
            autocomplete="tel"
            class="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none ring-0 focus:ring-2"
            :class="inputClass('holder.phone')"
            :value="holder.phone"
            :disabled="disabled"
            @input="onPhoneInput"
          />
          <p v-if="fieldErrors['holder.phone']" class="mt-1 text-xs text-red-600">
            {{ fieldErrors['holder.phone'] }}
          </p>
        </div>
        <div>
          <label class="text-xs font-semibold uppercase tracking-wide text-brand-gray" for="holder-cep">
            CEP
          </label>
          <input
            id="holder-cep"
            type="text"
            inputmode="numeric"
            autocomplete="postal-code"
            class="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none ring-0 focus:ring-2"
            :class="inputClass('holder.postal_code')"
            :value="holder.postal_code"
            :disabled="disabled"
            @input="onPostalCodeInput"
          />
          <p v-if="fieldErrors['holder.postal_code']" class="mt-1 text-xs text-red-600">
            {{ fieldErrors['holder.postal_code'] }}
          </p>
        </div>
        <div>
          <label
            class="text-xs font-semibold uppercase tracking-wide text-brand-gray"
            for="holder-address-number"
          >
            Número
          </label>
          <input
            id="holder-address-number"
            type="text"
            autocomplete="off"
            class="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none ring-0 focus:ring-2"
            :class="inputClass('holder.address_number')"
            :value="holder.address_number"
            :disabled="disabled"
            @input="updateHolder({ address_number: ($event.target as HTMLInputElement).value })"
          />
          <p v-if="fieldErrors['holder.address_number']" class="mt-1 text-xs text-red-600">
            {{ fieldErrors['holder.address_number'] }}
          </p>
        </div>
      </div>
    </section>

    <section>
      <div v-if="!billingOnly" class="flex items-center justify-between gap-2">
        <h2 class="text-lg font-semibold text-brand-ink">Cartão de crédito</h2>
        <span class="text-xs font-medium text-brand-gray">{{ cardBrandLabel(cardBrand) }}</span>
      </div>
      <div class="grid gap-4 sm:grid-cols-2" :class="billingOnly ? '' : 'mt-4'">
        <div class="sm:col-span-2">
          <label class="text-xs font-semibold uppercase tracking-wide text-brand-gray" for="card-number">
            Número do cartão
          </label>
          <input
            id="card-number"
            type="text"
            inputmode="numeric"
            autocomplete="cc-number"
            class="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none ring-0 focus:ring-2"
            :class="inputClass('credit_card.number')"
            :value="creditCard.number"
            :disabled="disabled"
            @input="onCardNumberInput"
          />
          <p v-if="fieldErrors['credit_card.number']" class="mt-1 text-xs text-red-600">
            {{ fieldErrors['credit_card.number'] }}
          </p>
        </div>
        <div class="sm:col-span-2">
          <label
            class="text-xs font-semibold uppercase tracking-wide text-brand-gray"
            for="card-holder-name"
          >
            Nome impresso no cartão
          </label>
          <input
            id="card-holder-name"
            type="text"
            autocomplete="cc-name"
            class="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none ring-0 focus:ring-2"
            :class="inputClass('credit_card.holder_name')"
            :value="creditCard.holder_name"
            :disabled="disabled"
            @input="updateCard({ holder_name: ($event.target as HTMLInputElement).value })"
          />
          <p v-if="fieldErrors['credit_card.holder_name']" class="mt-1 text-xs text-red-600">
            {{ fieldErrors['credit_card.holder_name'] }}
          </p>
        </div>
        <div>
          <label class="text-xs font-semibold uppercase tracking-wide text-brand-gray" for="card-expiry">
            Validade
          </label>
          <input
            id="card-expiry"
            type="text"
            inputmode="numeric"
            autocomplete="cc-exp"
            placeholder="MM/AA"
            class="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none ring-0 focus:ring-2"
            :class="inputClass('credit_card.expiry_month')"
            :value="expiryDisplay"
            :disabled="disabled"
            @input="onExpiryInput"
          />
          <p
            v-if="fieldErrors['credit_card.expiry_month'] || fieldErrors['credit_card.expiry_year']"
            class="mt-1 text-xs text-red-600"
          >
            {{ fieldErrors['credit_card.expiry_month'] || fieldErrors['credit_card.expiry_year'] }}
          </p>
        </div>
        <div>
          <label class="text-xs font-semibold uppercase tracking-wide text-brand-gray" for="card-cvv">
            CVV
          </label>
          <input
            id="card-cvv"
            type="password"
            inputmode="numeric"
            autocomplete="cc-csc"
            class="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none ring-0 focus:ring-2"
            :class="inputClass('credit_card.cvv')"
            :value="creditCard.cvv"
            :maxlength="cvvMaxLength(cardBrand)"
            :disabled="disabled"
            @input="
              updateCard({
                cvv: ($event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, cvvMaxLength(cardBrand)),
              })
            "
          />
          <p v-if="fieldErrors['credit_card.cvv']" class="mt-1 text-xs text-red-600">
            {{ fieldErrors['credit_card.cvv'] }}
          </p>
        </div>
      </div>
      <p v-if="!billingOnly" class="mt-3 text-xs text-brand-gray">
        Os dados do cartão são enviados com segurança ao processador de pagamentos e não são armazenados
        neste navegador.
      </p>
    </section>
  </div>
</template>
