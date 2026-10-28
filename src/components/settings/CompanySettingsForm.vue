<script setup lang="ts">
import { Loader2 } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'

import { fetchCompany, updateCompany } from '@/api/company'
import { isValidBrazilianDocument, maskCpfCnpj } from '@/utils/brazilianDocument'
import { maskPhoneBr } from '@/utils/billingFormat'
import { getErrorMessage, getValidationErrors } from '@/utils/errors'

const loading = ref(true)
const saving = ref(false)
const loadError = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const submitError = ref<string | null>(null)
const fieldErrors = ref<Record<string, string>>({})

const name = ref('')
const cnpj = ref('')
const phone = ref('')
const logoUrl = ref<string | null>(null)
const logoFile = ref<File | null>(null)
const logoPreview = ref<string | null>(null)

onMounted(() => {
  void load()
})

async function load(): Promise<void> {
  loading.value = true
  loadError.value = null
  try {
    const company = await fetchCompany()
    if (company) {
      name.value = company.name
      cnpj.value = company.cnpj ? maskCpfCnpj(company.cnpj) : ''
      phone.value = company.phone ? maskPhoneBr(company.phone) : ''
      logoUrl.value = company.logo_url
    }
  } catch (error) {
    loadError.value = getErrorMessage(error)
  } finally {
    loading.value = false
  }
}

function onCnpjInput(event: Event): void {
  cnpj.value = maskCpfCnpj((event.target as HTMLInputElement).value)
  delete fieldErrors.value.cnpj
}

function onPhoneInput(event: Event): void {
  phone.value = maskPhoneBr((event.target as HTMLInputElement).value)
  delete fieldErrors.value.phone
}

function onLogoChange(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  logoFile.value = file
  if (logoPreview.value) {
    URL.revokeObjectURL(logoPreview.value)
  }
  logoPreview.value = file ? URL.createObjectURL(file) : null
  delete fieldErrors.value.logo
}

function validateClient(): boolean {
  const errors: Record<string, string> = {}
  if (!name.value.trim()) {
    errors.name = 'Informe o nome da empresa.'
  }
  const cnpjDigits = cnpj.value.replace(/\D/g, '')
  if (!cnpjDigits) {
    errors.cnpj = 'Informe o CNPJ.'
  } else if (cnpjDigits.length !== 14 || !isValidBrazilianDocument(cnpj.value)) {
    errors.cnpj = 'CNPJ inválido.'
  }
  const phoneDigits = phone.value.replace(/\D/g, '')
  if (phoneDigits && phoneDigits.length < 10) {
    errors.phone = 'Telefone inválido.'
  }
  fieldErrors.value = errors
  return Object.keys(errors).length === 0
}

async function onSubmit(): Promise<void> {
  successMessage.value = null
  submitError.value = null
  if (!validateClient()) {
    return
  }

  saving.value = true
  try {
    const updated = await updateCompany({
      name: name.value.trim(),
      cnpj: cnpj.value,
      phone: phone.value,
      logo: logoFile.value,
    })
    logoUrl.value = updated.logo_url
    logoFile.value = null
    if (logoPreview.value) {
      URL.revokeObjectURL(logoPreview.value)
      logoPreview.value = null
    }
    successMessage.value = 'Dados da empresa atualizados.'
  } catch (error) {
    const validation = getValidationErrors(error)
    if (validation) {
      fieldErrors.value = validation
      return
    }
    submitError.value = getErrorMessage(error)
  } finally {
    saving.value = false
  }
}

const displayedLogo = computed(() => logoPreview.value ?? logoUrl.value)
</script>

<template>
  <section class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
    <h2 class="font-display text-lg font-semibold text-brand-ink">Dados da empresa</h2>
    <p class="mt-2 text-sm text-brand-gray">
      Nome, CNPJ, telefone e logotipo usados no painel e nas comunicações com clientes.
    </p>

    <div v-if="loading" class="mt-8 space-y-4">
      <div class="h-10 animate-pulse rounded-lg bg-slate-100" />
      <div class="h-10 animate-pulse rounded-lg bg-slate-100" />
      <div class="h-10 animate-pulse rounded-lg bg-slate-100" />
    </div>

    <p v-else-if="loadError" class="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {{ loadError }}
      <button type="button" class="ml-2 font-semibold underline" @click="load">Tentar novamente</button>
    </p>

    <form v-else class="mt-6 space-y-5" @submit.prevent="onSubmit">
      <p
        v-if="successMessage"
        class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
        role="status"
      >
        {{ successMessage }}
      </p>
      <p
        v-if="submitError"
        class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        role="alert"
      >
        {{ submitError }}
      </p>

      <div>
        <label for="company-name" class="text-xs font-semibold uppercase tracking-wide text-brand-gray">Nome</label>
        <input
          id="company-name"
          v-model="name"
          type="text"
          autocomplete="organization"
          class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          :class="fieldErrors.name ? 'border-red-300' : ''"
          @input="delete fieldErrors.name"
        />
        <p v-if="fieldErrors.name" class="mt-1 text-xs text-red-600">{{ fieldErrors.name }}</p>
      </div>

      <div class="grid gap-5 sm:grid-cols-2">
        <div>
          <label for="company-cnpj" class="text-xs font-semibold uppercase tracking-wide text-brand-gray">CNPJ</label>
          <input
            id="company-cnpj"
            :value="cnpj"
            type="text"
            inputmode="numeric"
            autocomplete="off"
            placeholder="00.000.000/0000-00"
            class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            :class="fieldErrors.cnpj ? 'border-red-300' : ''"
            @input="onCnpjInput"
          />
          <p v-if="fieldErrors.cnpj" class="mt-1 text-xs text-red-600">{{ fieldErrors.cnpj }}</p>
        </div>
        <div>
          <label for="company-phone" class="text-xs font-semibold uppercase tracking-wide text-brand-gray"
            >Telefone</label
          >
          <input
            id="company-phone"
            :value="phone"
            type="tel"
            inputmode="tel"
            autocomplete="tel"
            placeholder="(00) 00000-0000"
            class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            :class="fieldErrors.phone ? 'border-red-300' : ''"
            @input="onPhoneInput"
          />
          <p v-if="fieldErrors.phone" class="mt-1 text-xs text-red-600">{{ fieldErrors.phone }}</p>
        </div>
      </div>

      <div>
        <label for="company-logo" class="text-xs font-semibold uppercase tracking-wide text-brand-gray">Logotipo</label>
        <div class="mt-2 flex flex-wrap items-center gap-4">
          <div
            v-if="displayedLogo"
            class="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-brand-mist"
          >
            <img :src="displayedLogo" alt="" class="max-h-full max-w-full object-contain" />
          </div>
          <input
            id="company-logo"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            class="text-sm text-brand-gray file:mr-3 file:rounded-lg file:border-0 file:bg-brand-mist file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand-indigo"
            @change="onLogoChange"
          />
        </div>
        <p v-if="fieldErrors.logo" class="mt-1 text-xs text-red-600">{{ fieldErrors.logo }}</p>
      </div>

      <div class="flex justify-end pt-2">
        <button
          type="submit"
          class="inline-flex items-center gap-2 rounded-xl bg-brand-indigo px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          :disabled="saving"
        >
          <Loader2 v-if="saving" class="h-4 w-4 animate-spin" aria-hidden="true" />
          Salvar alterações
        </button>
      </div>
    </form>
  </section>
</template>
