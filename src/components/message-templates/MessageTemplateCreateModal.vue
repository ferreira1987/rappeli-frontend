<script setup lang="ts">
import { Loader2, X } from '@lucide/vue'
import { computed, ref, watch } from 'vue'

import { UiButton, UiIconButton, UiInput, UiModalLayer } from '@/components/ui'
import { uiSelectClass, uiTextareaClass } from '@/components/ui/uiSelectClass'
import { useEscapeKey } from '@/composables/useEscapeKey'
import type { CreateMessageTemplatePayload, MessageTemplateCategory } from '@/types/messageTemplates'
import { META_TEMPLATE_VARIABLE_EXAMPLES } from '@/utils/messageTemplatePreview'

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
  <UiModalLayer
    :open="open"
    z-class="z-50"
    labelled-by="message-template-create-title"
    scrollable
    @close="onClose"
  >
    <div
      class="mx-auto max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl"
    >
      <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 id="message-template-create-title" class="font-display text-lg font-semibold text-brand-ink">
          Novo modelo de mensagem
        </h2>
        <UiIconButton type="button" ariaLabel="Fechar" @click="onClose">
          <X class="h-5 w-5" aria-hidden="true" />
        </UiIconButton>
      </div>

      <form
        class="space-y-4 p-5"
        :aria-busy="submitting || undefined"
        @submit.prevent="onSubmit"
      >
        <p
          v-if="formError"
          class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {{ formError }}
        </p>

        <div class="space-y-1">
          <label class="block text-sm font-medium text-brand-ink" for="template-name">Nome do modelo *</label>
          <UiInput
            id="template-name"
            v-model="name"
            type="text"
            autocomplete="off"
            placeholder="lembrete_retorno"
            :invalid="Boolean(displayFieldErrors.name)"
          />
          <p class="text-xs text-brand-gray">Identificador enviado à Meta (snake_case).</p>
          <p v-if="displayFieldErrors.name" class="text-xs text-red-600">{{ displayFieldErrors.name }}</p>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="space-y-1">
            <label class="block text-sm font-medium text-brand-ink" for="template-language">Idioma</label>
            <select id="template-language" v-model="language" :class="uiSelectClass">
              <option v-for="option in languageOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-brand-ink" for="template-category">Categoria</label>
            <select id="template-category" v-model="category" :class="uiSelectClass">
              <option v-for="option in categoryOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="space-y-1">
          <label class="block text-sm font-medium text-brand-ink" for="template-body">Corpo da mensagem *</label>
          <textarea
            id="template-body"
            v-model="bodyText"
            rows="5"
            placeholder="Olá {{1}}, está na hora do seu retorno."
            :class="`${uiTextareaClass} ${displayFieldErrors.body ? 'border-red-300' : ''}`"
          />
          <p class="text-xs text-brand-gray">
            Variáveis dinâmicas no formato
            <code class="text-brand-ink">{{ META_TEMPLATE_VARIABLE_EXAMPLES[0] }}</code>,
            <code class="text-brand-ink">{{ META_TEMPLATE_VARIABLE_EXAMPLES[1] }}</code>…
          </p>
          <p v-if="displayFieldErrors.body" class="text-xs text-red-600">{{ displayFieldErrors.body }}</p>
        </div>

        <div class="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <UiButton type="button" variant="secondary" :disabled="submitting" @click="onClose">
            Cancelar
          </UiButton>
          <UiButton type="submit" variant="primary" :disabled="submitting">
            <Loader2 v-if="submitting" class="h-4 w-4 animate-spin" aria-hidden="true" />
            Enviar para aprovação
          </UiButton>
        </div>
      </form>
    </div>
  </UiModalLayer>
</template>
