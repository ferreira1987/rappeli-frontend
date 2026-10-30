<script setup lang="ts">
import { Check, CloudUpload, ImageIcon, Loader2 } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'

import { fetchCompany, updateCompany } from '@/api/company'
import UiButton from '@/components/ui/UiButton.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiInput from '@/components/ui/UiInput.vue'
import { useAuthStore } from '@/stores/auth'
import { isCompanyAdministrator } from '@/utils/authRole'
import { isValidBrazilianDocument, maskCpfCnpj } from '@/utils/brazilianDocument'
import { maskPhoneBr } from '@/utils/billingFormat'
import { getErrorMessage, getValidationErrors } from '@/utils/errors'

const auth = useAuthStore()

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
const logoDragActive = ref(false)

const logoInputRef = ref<HTMLInputElement | null>(null)

const canEdit = computed(() => isCompanyAdministrator(auth.user))

const displayedLogo = computed(() => logoPreview.value ?? logoUrl.value)

onMounted(() => {
  void (async () => {
    if (!auth.bootstrapped) {
      await auth.bootstrap()
    }
    await load()
  })()
})

async function load(): Promise<void> {
  loading.value = true
  loadError.value = null
  try {
    const company = await fetchCompany()
    name.value = company?.name ?? ''
    cnpj.value = company?.cnpj ? maskCpfCnpj(company.cnpj) : ''
    phone.value = company?.phone ? maskPhoneBr(company.phone) : ''
    logoUrl.value = company?.logo_url ?? null
  } catch (error) {
    loadError.value = getErrorMessage(error)
  } finally {
    loading.value = false
  }
}

function onNameUpdate(value: string): void {
  name.value = value
  delete fieldErrors.value.name
}

function onCnpjUpdate(value: string): void {
  if (!canEdit.value) {
    return
  }
  cnpj.value = maskCpfCnpj(value)
  delete fieldErrors.value.cnpj
}

function onPhoneUpdate(value: string): void {
  if (!canEdit.value) {
    return
  }
  phone.value = maskPhoneBr(value)
  delete fieldErrors.value.phone
}

function applyLogoFile(file: File | null): void {
  if (!canEdit.value) {
    return
  }
  logoFile.value = file
  if (logoPreview.value) {
    URL.revokeObjectURL(logoPreview.value)
  }
  logoPreview.value = file ? URL.createObjectURL(file) : null
  delete fieldErrors.value.logo
}

function onLogoChange(event: Event): void {
  const input = event.target as HTMLInputElement
  applyLogoFile(input.files?.[0] ?? null)
}

function openLogoPicker(): void {
  logoInputRef.value?.click()
}

function onLogoDrop(event: DragEvent): void {
  event.preventDefault()
  logoDragActive.value = false
  if (!canEdit.value) {
    return
  }
  const file = event.dataTransfer?.files?.[0] ?? null
  if (file && file.type.startsWith('image/')) {
    applyLogoFile(file)
  }
}

function onLogoDragOver(event: DragEvent): void {
  event.preventDefault()
  if (canEdit.value) {
    logoDragActive.value = true
  }
}

function onLogoDragLeave(): void {
  logoDragActive.value = false
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
  if (!canEdit.value) {
    return
  }

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
    logoUrl.value = updated?.logo_url ?? null
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
</script>

<template>
  <UiCard padding="lg">
    <h2 class="text-lg font-semibold text-brand-ink">Dados da empresa</h2>
    <p class="mt-2 text-sm text-brand-gray">
      Nome, CNPJ, telefone e logotipo usados no painel e nas comunicações.
    </p>
    <p v-if="!loading && !canEdit" class="mt-3 text-sm text-brand-gray">
      Apenas administradores podem editar estes dados. Você está visualizando em modo leitura.
    </p>

    <div v-if="loading" class="mt-8 space-y-4">
      <div class="h-10 animate-pulse rounded-lg bg-slate-100" />
      <div class="h-10 animate-pulse rounded-lg bg-slate-100" />
      <div class="h-10 animate-pulse rounded-lg bg-slate-100" />
    </div>

    <p
      v-else-if="loadError"
      class="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      {{ loadError }}
      <button type="button" class="ml-2 font-semibold underline" @click="load">Tentar novamente</button>
    </p>

    <form v-else class="mt-6 space-y-5" @submit.prevent="onSubmit">
      <p
        v-if="successMessage"
        class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
        role="status"
      >
        {{ successMessage }}
      </p>
      <p
        v-if="submitError"
        class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        role="alert"
      >
        {{ submitError }}
      </p>

      <div>
        <label for="company-name" class="text-sm font-medium text-brand-ink">Nome da empresa</label>
        <div class="mt-1.5">
          <UiInput
            id="company-name"
            :model-value="name"
            autocomplete="organization"
            :readonly="!canEdit"
            :invalid="Boolean(fieldErrors.name)"
            @update:model-value="onNameUpdate"
          />
        </div>
        <p v-if="fieldErrors.name" class="mt-1 text-xs text-red-600">{{ fieldErrors.name }}</p>
      </div>

      <div class="grid gap-5 sm:grid-cols-2">
        <div>
          <label for="company-cnpj" class="text-sm font-medium text-brand-ink">CNPJ</label>
          <div class="mt-1.5">
            <UiInput
              id="company-cnpj"
              :model-value="cnpj"
              inputmode="numeric"
              autocomplete="off"
              placeholder="00.000.000/0000-00"
              :readonly="!canEdit"
              :invalid="Boolean(fieldErrors.cnpj)"
              @update:model-value="onCnpjUpdate"
            />
          </div>
          <p v-if="fieldErrors.cnpj" class="mt-1 text-xs text-red-600">{{ fieldErrors.cnpj }}</p>
        </div>
        <div>
          <label for="company-phone" class="text-sm font-medium text-brand-ink">Telefone de contato</label>
          <div class="mt-1.5">
            <UiInput
              id="company-phone"
              :model-value="phone"
              type="tel"
              inputmode="tel"
              autocomplete="tel"
              placeholder="(00) 00000-0000"
              :readonly="!canEdit"
              :invalid="Boolean(fieldErrors.phone)"
              @update:model-value="onPhoneUpdate"
            />
          </div>
          <p v-if="fieldErrors.phone" class="mt-1 text-xs text-red-600">{{ fieldErrors.phone }}</p>
        </div>
      </div>

      <div>
        <span class="text-sm font-medium text-brand-ink">Logotipo</span>
        <div class="mt-2 flex flex-col gap-4 sm:flex-row sm:items-stretch">
          <div
            class="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-brand-surface"
          >
            <img
              v-if="displayedLogo"
              :src="displayedLogo"
              alt=""
              class="max-h-full max-w-full object-contain"
            />
            <div v-else class="flex flex-col items-center gap-1 px-1 text-center">
              <ImageIcon class="h-5 w-5 text-brand-gray" aria-hidden="true" />
              <span class="text-[10px] font-medium text-brand-gray">Sem logo</span>
            </div>
          </div>

          <div
            class="flex min-h-[5rem] flex-1 flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed px-4 py-3 transition-colors"
            :class="
              logoDragActive
                ? 'border-brand-indigo bg-brand-mist'
                : 'border-slate-300 bg-brand-surface'
            "
            @dragover="onLogoDragOver"
            @dragleave="onLogoDragLeave"
            @drop="onLogoDrop"
          >
            <div class="flex min-w-0 items-start gap-3">
              <CloudUpload class="mt-0.5 h-5 w-5 shrink-0 text-brand-gray" aria-hidden="true" />
              <div class="min-w-0 text-sm">
                <p class="font-medium text-brand-ink">Arraste o logo ou escolha um arquivo</p>
                <p class="mt-0.5 text-xs text-brand-gray">Formatos aceitos: PNG, JPG ou SVG até 2MB</p>
              </div>
            </div>
            <UiButton
              v-if="canEdit"
              type="button"
              variant="secondary"
              size="sm"
              class="shrink-0"
              @click="openLogoPicker"
            >
              Selecionar
            </UiButton>
            <input
              v-if="canEdit"
              ref="logoInputRef"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              class="sr-only"
              @change="onLogoChange"
            />
          </div>
        </div>
        <p v-if="fieldErrors.logo" class="mt-1 text-xs text-red-600">{{ fieldErrors.logo }}</p>
      </div>

      <div v-if="canEdit" class="flex justify-end border-t border-slate-100 pt-5">
        <UiButton type="submit" :disabled="saving">
          <Loader2 v-if="saving" class="h-4 w-4 animate-spin" aria-hidden="true" />
          <Check v-else class="h-4 w-4" aria-hidden="true" />
          Salvar alterações
        </UiButton>
      </div>
    </form>
  </UiCard>
</template>
