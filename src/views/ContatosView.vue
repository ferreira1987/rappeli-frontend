<script setup lang="ts">
import { Loader2, Plus, Search, Upload, Users } from '@lucide/vue'
import { computed, onMounted, ref, watch } from 'vue'

import { createContact, fetchContacts, importContactsCsv } from '@/api/contacts'
import AppPageHeader from '@/components/app/AppPageHeader.vue'
import EmptyState from '@/components/app/EmptyState.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import { useEscapeKey } from '@/composables/useEscapeKey'
import { panelBreadcrumbs } from '@/constants/panelBreadcrumbs'
import type { Contact } from '@/types/contacts'
import { formatBrazilPhone } from '@/utils/phone'
import { getErrorMessage, getValidationErrors } from '@/utils/errors'
import { pluralizePt } from '@/utils/pluralize'

const contacts = ref<Contact[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const search = ref('')
const searchDebounced = ref('')

const createOpen = ref(false)
const createName = ref('')
const createPhone = ref('')
const createOptIn = ref(false)
const createSubmitting = ref(false)
const createError = ref<string | null>(null)
const createFieldErrors = ref<Record<string, string>>({})

const importInput = ref<HTMLInputElement | null>(null)
const importMessage = ref<string | null>(null)
const importSubmitting = ref(false)

let searchTimer: ReturnType<typeof setTimeout> | undefined

watch(search, (value) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    searchDebounced.value = value.trim()
  }, 300)
})

const hasContacts = computed(() => contacts.value.length > 0)

async function loadContacts(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    const page = await fetchContacts({
      search: searchDebounced.value || undefined,
      per_page: 100,
    })
    contacts.value = page.contacts
  } catch (err) {
    error.value = getErrorMessage(err)
    contacts.value = []
  } finally {
    loading.value = false
  }
}

watch(searchDebounced, () => {
  void loadContacts()
})

onMounted(() => {
  void loadContacts()
})

function openCreate(): void {
  createName.value = ''
  createPhone.value = ''
  createOptIn.value = false
  createError.value = null
  createFieldErrors.value = {}
  createOpen.value = true
}

useEscapeKey(
  () => createOpen.value,
  () => {
    createOpen.value = false
  },
)

async function submitCreate(): Promise<void> {
  createSubmitting.value = true
  createError.value = null
  createFieldErrors.value = {}
  const phoneDigits = createPhone.value.replace(/\D/g, '')
  try {
    await createContact({
      phone: phoneDigits,
      display_name: createName.value.trim() || null,
      marketing_opt_in: createOptIn.value,
    })
    createOpen.value = false
    await loadContacts()
  } catch (err) {
    const validation = getValidationErrors(err)
    if (validation) {
      createFieldErrors.value = validation
    } else {
      createError.value = getErrorMessage(err)
    }
  } finally {
    createSubmitting.value = false
  }
}

function triggerImport(): void {
  importInput.value?.click()
}

async function onImportFile(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) {
    return
  }
  importSubmitting.value = true
  importMessage.value = null
  try {
    const result = await importContactsCsv(file)
    importMessage.value = `Importação concluída: ${result.created} criados, ${result.updated} atualizados, ${result.skipped} ignorados.`
    await loadContacts()
  } catch (err) {
    const validation = getValidationErrors(err)
    importMessage.value = validation?.file ?? getErrorMessage(err)
  } finally {
    importSubmitting.value = false
  }
}
</script>

<template>
  <div class="flex min-h-full flex-col bg-brand-mist">
    <AppPageHeader
      title="Contatos"
      subtitle="Organize clientes, tags e importações em um só lugar."
      :breadcrumbs="panelBreadcrumbs({ label: 'Contatos' })"
    >
      <template #actions>
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-brand-ink hover:bg-slate-50 disabled:opacity-60"
          :disabled="importSubmitting"
          @click="triggerImport"
        >
          <Upload class="h-4 w-4 text-brand-gray" aria-hidden="true" />
          Importar CSV
        </button>
        <input
          ref="importInput"
          type="file"
          accept=".csv,text/csv"
          class="hidden"
          @change="onImportFile"
        />
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white hover:bg-brand-indigo-hover"
          @click="openCreate"
        >
          <Plus class="h-4 w-4" aria-hidden="true" />
          Novo contato
        </button>
      </template>
    </AppPageHeader>

    <div class="flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <p v-if="importMessage" class="text-sm text-brand-indigo" role="status">{{ importMessage }}</p>

      <div class="relative max-w-md">
        <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray" />
        <input
          v-model="search"
          type="search"
          placeholder="Buscar por nome ou telefone…"
          class="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
        />
      </div>

      <div v-if="loading" class="flex justify-center py-16">
        <Loader2 class="h-8 w-8 animate-spin text-brand-indigo" aria-label="Carregando contatos" />
      </div>

      <div v-else-if="error" class="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p class="text-sm text-red-800">{{ error }}</p>
        <button
          type="button"
          class="mt-3 rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white"
          @click="loadContacts"
        >
          Tentar novamente
        </button>
      </div>

      <EmptyState
        v-else-if="!hasContacts"
        :icon="Users"
        title="Nenhum contato cadastrado"
        description="Importe uma planilha ou adicione contatos manualmente."
      >
        <template #actions>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-brand-ink hover:bg-slate-50"
            @click="triggerImport"
          >
            <Upload class="h-4 w-4 text-brand-gray" aria-hidden="true" />
            Importar CSV
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white hover:bg-brand-indigo-hover"
            @click="openCreate"
          >
            <Plus class="h-4 w-4" aria-hidden="true" />
            Novo contato
          </button>
        </template>
      </EmptyState>

      <section v-else class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <p class="border-b border-slate-100 px-4 py-3 text-xs text-brand-gray">
          {{
            pluralizePt(contacts.length, 'contato', {
              one: 'contato listado',
              other: 'contatos listados',
            })
          }}
        </p>
        <table class="w-full text-left text-sm">
          <thead class="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase text-brand-gray">
            <tr>
              <th class="px-4 py-3">Nome</th>
              <th class="px-4 py-3">Telefone</th>
              <th class="px-4 py-3">Opt-in marketing</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="contact in contacts" :key="contact.id" class="hover:bg-slate-50/80">
              <td class="px-4 py-3 font-medium text-brand-ink">
                {{ contact.display_name || '—' }}
              </td>
              <td class="px-4 py-3 text-brand-gray">
                {{ formatBrazilPhone(contact.phone) || contact.phone }}
              </td>
              <td class="px-4 py-3 text-brand-gray">
                {{ contact.marketing_opt_in ? 'Sim' : 'Não' }}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <AppPageFooter />
    </div>

    <Teleport to="body">
      <div
        v-if="createOpen"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4"
        role="dialog"
        aria-modal="true"
        @click.self="createOpen = false"
      >
        <form class="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl" @submit.prevent="submitCreate">
          <h2 class="font-display text-lg font-bold text-brand-ink">Novo contato</h2>
          <p v-if="createError" class="mt-2 text-sm text-red-600" role="alert">{{ createError }}</p>
          <div class="mt-4 space-y-3">
            <div>
              <label class="text-xs font-semibold text-brand-ink" for="contact-phone">Telefone *</label>
              <input
                id="contact-phone"
                v-model="createPhone"
                type="tel"
                class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="5511999999999"
              />
              <p v-if="createFieldErrors.phone" class="mt-1 text-xs text-red-600">{{ createFieldErrors.phone }}</p>
            </div>
            <div>
              <label class="text-xs font-semibold text-brand-ink" for="contact-name">Nome</label>
              <input
                id="contact-name"
                v-model="createName"
                type="text"
                class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <p v-if="createFieldErrors.display_name" class="mt-1 text-xs text-red-600">
                {{ createFieldErrors.display_name }}
              </p>
            </div>
            <label class="flex items-center gap-2 text-sm">
              <input v-model="createOptIn" type="checkbox" class="rounded text-brand-indigo" />
              Opt-in para campanhas de marketing
            </label>
          </div>
          <div class="mt-6 flex justify-end gap-2">
            <button type="button" class="rounded-lg border border-slate-200 px-4 py-2 text-sm" @click="createOpen = false">
              Cancelar
            </button>
            <button
              type="submit"
              class="rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              :disabled="createSubmitting"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </Teleport>
  </div>
</template>
