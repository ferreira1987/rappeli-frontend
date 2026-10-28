<script setup lang="ts">
import { Loader2, X } from '@lucide/vue'
import { computed, ref, watch } from 'vue'

import type { CreateMessageTemplatePayload, MessageTemplateCategory } from '@/types/messageTemplates'
import { useEscapeKey } from '@/composables/useEscapeKey'

const props = defineProps<{
  open: boolean
  submitting?: boolean
  serverFieldErrors?: Record<string, string>
  formError?: string | null
}>()

const emit = defineEmits<{
  close: []
  save: [payload: CreateMessageTemplatePayload]
}>()

const name = ref('')
const language = ref('pt_BR')
const category = ref<MessageTemplateCategory>('MARKETING')
const bodyText = ref('')
const fieldErrors = ref<Record<string, string>>({})

const categoryOptions: { value: MessageTemplateCategory; label: string }[] = [
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'UTILITY', label: 'Utilidade' },
  { value: 'AUTHENTICATION', label: 'Autenticação' },
]

const languageOptions = [
  { value: 'pt_BR', label: 'Português (Brasil)' },
  { value: 'en_US', label: 'English (US)' },
  { value: 'es_ES', label: 'Español' },
]

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    name.value = ''
    language.value = 'pt_BR'
    category.value = 'MARKETING'
    bodyText.value = ''
    fieldErrors.value = {}
  },
)

const displayFieldErrors = computed(() => ({ ...fieldErrors.value, ...props.serverFieldErrors }))

function onClose(): void {
  emit('close')
}

useEscapeKey(
  () => props.open,
  () => onClose(),
)

function onSubmit(): void {
  fieldErrors.value = {}
  const trimmedName = name.value.trim()
  const trimmedBody = bodyText.value.trim()

  if (!trimmedName) {
    fieldErrors.value.name = 'Informe o nome do modelo.'
    return
  }
  if (!/^[a-z0-9_]+$/.test(trimmedName)) {
    fieldErrors.value.name = 'Use apenas letras minúsculas, números e underscore (ex.: lembrete_retorno).'
    return
  }
  if (!trimmedBody) {
    fieldErrors.value.body = 'Informe o texto do corpo da mensagem.'
    return
  }

  emit('save', {
    name: trimmedName,
    language: language.value,
    category: category.value,
    components: [{ type: 'BODY', text: trimmedBody }],
  })
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="message-template-create-title"
    @click.self="onClose"
  >
    <div class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
      <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 id="message-template-create-title" class="font-display text-lg font-semibold text-brand-ink">
          Novo modelo de mensagem
        </h2>
        <button
          type="button"
          class="rounded-lg p-1 text-brand-gray hover:bg-slate-100"
          aria-label="Fechar"
          @click="onClose"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <form class="space-y-4 p-5" @submit.prevent="onSubmit">
        <p v-if="formError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {{ formError }}
        </p>

        <div>
          <label class="block text-sm font-medium text-brand-ink" for="template-name">Nome do modelo *</label>
          <input
            id="template-name"
            v-model="name"
            type="text"
            autocomplete="off"
            placeholder="lembrete_retorno"
            class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <p class="mt-1 text-xs text-brand-gray">Identificador enviado à Meta (snake_case).</p>
          <p v-if="displayFieldErrors.name" class="mt-1 text-xs text-red-600">{{ displayFieldErrors.name }}</p>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="block text-sm font-medium text-brand-ink" for="template-language">Idioma</label>
            <select
              id="template-language"
              v-model="language"
              class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option v-for="option in languageOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-brand-ink" for="template-category">Categoria</label>
            <select
              id="template-category"
              v-model="category"
              class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option v-for="option in categoryOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-brand-ink" for="template-body">Corpo da mensagem *</label>
          <textarea
            id="template-body"
            v-model="bodyText"
            rows="5"
            placeholder="Olá {{1}}, está na hora do seu retorno."
            class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <p class="mt-1 text-xs text-brand-gray">
            Variáveis dinâmicas no formato <code class="text-brand-ink">{{ '{{1}}' }}</code>,
            <code class="text-brand-ink">{{ '{{2}}' }}</code>…
          </p>
          <p v-if="displayFieldErrors.body" class="mt-1 text-xs text-red-600">{{ displayFieldErrors.body }}</p>
        </div>

        <div class="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-brand-ink"
            :disabled="submitting"
            @click="onClose"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="inline-flex items-center gap-2 rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            :disabled="submitting"
          >
            <Loader2 v-if="submitting" class="h-4 w-4 animate-spin" />
            Enviar para aprovação
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
