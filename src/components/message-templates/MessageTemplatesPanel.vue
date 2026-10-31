<script setup lang="ts">
import { Info, Loader2, Plus, RefreshCw, Search } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import {
  createMessageTemplate,
  fetchMessageTemplatesList,
  syncMessageTemplates,
} from '@/api/messageTemplates'
import MessageTemplateCreateModal from '@/components/message-templates/MessageTemplateCreateModal.vue'
import type { MessageTemplate, MessageTemplateStatus } from '@/types/messageTemplates'
import { getApiErrorCode, getErrorMessage, getValidationErrors } from '@/utils/errors'
import {
  messageTemplateCategoryLabel,
  messageTemplateStatusClass,
  messageTemplateStatusLabel,
} from '@/utils/messageTemplateLabels'
import { resolveTemplateVariableIndexes } from '@/utils/messageTemplatePreview'

const emit = defineEmits<{
  'update:count': [count: number]
}>()

const loading = ref(true)
const syncing = ref(false)
const creating = ref(false)
const error = ref<string | null>(null)
const statusMessage = ref<string | null>(null)

const templates = ref<MessageTemplate[]>([])
const whatsappConfigured = ref(false)

const search = ref('')
const statusFilter = ref<'all' | MessageTemplateStatus>('all')

const createModalOpen = ref(false)
const createFormError = ref<string | null>(null)
const createFieldErrors = ref<Record<string, string>>({})

const filteredTemplates = computed(() => {
  let list = templates.value
  if (statusFilter.value !== 'all') {
    list = list.filter((template) => String(template.status ?? '').toUpperCase() === statusFilter.value)
  }
  const query = search.value.trim().toLowerCase()
  if (query) {
    list = list.filter((template) => template.name.toLowerCase().includes(query))
  }
  return list
})

function emitCount(): void {
  emit('update:count', templates.value.length)
}

async function loadTemplates(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    const result = await fetchMessageTemplatesList()
    templates.value = result.templates
    whatsappConfigured.value = result.whatsappConfigured
    emitCount()
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadTemplates()
})

async function onSync(): Promise<void> {
  syncing.value = true
  statusMessage.value = null
  error.value = null
  try {
    const result = await syncMessageTemplates()
    templates.value = result.templates
    whatsappConfigured.value = true
    statusMessage.value = `${result.synced} modelo(s) sincronizado(s) da Meta.`
    emitCount()
  } catch (err) {
    if (getApiErrorCode(err) === 'whatsapp_meta_not_configured') {
      whatsappConfigured.value = false
      error.value = getErrorMessage(err)
    } else {
      error.value = getErrorMessage(err)
    }
  } finally {
    syncing.value = false
  }
}

function openCreateModal(): void {
  createFormError.value = null
  createFieldErrors.value = {}
  createModalOpen.value = true
}

async function onCreate(
  payload: Parameters<typeof createMessageTemplate>[0],
): Promise<void> {
  creating.value = true
  createFormError.value = null
  createFieldErrors.value = {}
  try {
    const created = await createMessageTemplate(payload)
    templates.value = [created, ...templates.value.filter((item) => item.id !== created.id)]
    createModalOpen.value = false
    statusMessage.value = `Modelo "${created.name}" enviado para aprovação na Meta.`
    emitCount()
  } catch (err) {
    const validation = getValidationErrors(err)
    if (validation) {
      createFieldErrors.value = validation
    } else if (getApiErrorCode(err) === 'whatsapp_meta_not_configured') {
      whatsappConfigured.value = false
      createFormError.value = getErrorMessage(err)
    } else {
      createFormError.value = getErrorMessage(err)
    }
  } finally {
    creating.value = false
  }
}

function variableSummary(template: MessageTemplate): string {
  const indexes = resolveTemplateVariableIndexes(template.variables, template.body)
  if (!indexes.length) {
    return 'Sem variáveis'
  }
  return indexes.map((index) => `{{${index}}}`).join(', ')
}
</script>

<template>
  <div class="space-y-4">
    <div class="rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-xs">
      <div class="flex items-start gap-3">
        <Info class="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
        <p class="text-sm leading-relaxed text-blue-900">
          Modelos são criados e aprovados pela Meta. Campanhas só podem usar modelos com status
          <span class="font-semibold">Aprovado</span> e devem respeitar o opt-in dos contatos.
        </p>
      </div>
    </div>

    <div
      v-if="!loading && !whatsappConfigured"
      class="rounded-xl border border-amber-300 bg-amber-50 p-4 shadow-xs"
      role="status"
    >
      <p class="text-sm font-medium text-amber-950">
        WhatsApp Business (Meta) não está configurado para esta empresa.
      </p>
      <p class="mt-1 text-sm text-amber-900">
        Conecte a conta em
        <RouterLink
          :to="{ name: 'configuracoes-whatsapp' }"
          class="font-semibold text-brand-indigo hover:underline"
        >
          Configurações → WhatsApp
        </RouterLink>
        para sincronizar modelos ou enviar novos para aprovação.
      </p>
    </div>

    <p v-if="statusMessage" class="text-sm text-brand-indigo" role="status">{{ statusMessage }}</p>

    <div class="rounded-xl border border-slate-200 bg-white shadow-xs">
      <div class="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex flex-1 flex-wrap items-center gap-3">
          <div class="relative min-w-[200px] flex-1">
            <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray" />
            <input
              v-model="search"
              type="search"
              placeholder="Buscar modelo…"
              aria-label="Buscar modelo"
              class="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm placeholder:text-slate-400"
            />
          </div>
          <label for="template-status-filter" class="sr-only">Filtrar por status</label>
          <select
            id="template-status-filter"
            v-model="statusFilter"
            aria-label="Filtrar por status"
            class="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-brand-ink"
          >
            <option value="all">Todos os status</option>
            <option value="APPROVED">Aprovado</option>
            <option value="PENDING">Pendente</option>
            <option value="REJECTED">Rejeitado</option>
          </select>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-brand-ink hover:bg-slate-50 disabled:opacity-60"
            :disabled="syncing || loading"
            @click="onSync"
          >
            <RefreshCw class="h-4 w-4" :class="syncing ? 'animate-spin' : ''" />
            {{ syncing ? 'Sincronizando…' : 'Sincronizar' }}
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white hover:bg-brand-indigo-hover disabled:opacity-60"
            :disabled="loading"
            @click="openCreateModal"
          >
            <Plus class="h-4 w-4" />
            Novo modelo
          </button>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center py-16">
        <Loader2 class="h-8 w-8 animate-spin text-brand-indigo" aria-label="Carregando modelos" />
      </div>
      <div v-else-if="error" class="p-6 text-center">
        <p class="text-sm text-red-800">{{ error }}</p>
        <button
          type="button"
          class="mt-3 rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white"
          @click="loadTemplates"
        >
          Tentar novamente
        </button>
      </div>
      <ul v-else class="divide-y divide-slate-100">
        <li
          v-for="template in filteredTemplates"
          :key="template.id"
          class="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-start sm:justify-between"
        >
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <p class="font-semibold text-brand-ink">{{ template.name }}</p>
              <span
                class="rounded-full border px-2 py-0.5 text-[11px] font-semibold"
                :class="messageTemplateStatusClass(template.status)"
              >
                {{ messageTemplateStatusLabel(template.status) }}
              </span>
            </div>
            <p class="mt-1 text-xs text-brand-gray">
              {{ messageTemplateCategoryLabel(template.category) }}
              <span v-if="template.locale"> · {{ template.locale }}</span>
              · {{ variableSummary(template) }}
            </p>
            <p v-if="template.body" class="mt-2 line-clamp-2 text-sm text-brand-ink/80">
              {{ template.body }}
            </p>
          </div>
        </li>
        <li v-if="!filteredTemplates.length" class="px-4 py-10 text-center text-sm text-brand-gray">
          Nenhum modelo encontrado.
        </li>
      </ul>
    </div>

    <MessageTemplateCreateModal
      :open="createModalOpen"
      :submitting="creating"
      :form-error="createFormError"
      :server-field-errors="createFieldErrors"
      @close="createModalOpen = false"
      @save="onCreate"
    />
  </div>
</template>
