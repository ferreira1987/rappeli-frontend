<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'

import MessageFieldMeta from '@/components/auto-replies/MessageFieldMeta.vue'
import { UiButton, UiInput, UiModalLayer } from '@/components/ui'
import { uiSelectClass } from '@/components/ui/uiSelectClass'
import { useEscapeKey } from '@/composables/useEscapeKey'
import type { KeywordMatchType, KeywordRule, KeywordRuleWrite } from '@/types/autoReplies'

const props = defineProps<{
  open: boolean
  initial?: KeywordRule | null
  saving?: boolean
  serverErrors?: Record<string, string> | null
}>()

const emit = defineEmits<{
  close: []
  submit: [payload: KeywordRuleWrite]
}>()

const form = reactive({
  keyword: '',
  response_body: '',
  match_type: 'contains' as KeywordMatchType,
  priority: 100,
  is_active: true,
})

const isEditing = computed(() => props.initial != null)

watch(
  () => [props.open, props.initial] as const,
  ([open, initial]) => {
    if (!open) {
      return
    }
    form.keyword = initial?.keyword ?? ''
    form.response_body = initial?.response_body ?? ''
    form.match_type = initial?.match_type ?? 'contains'
    form.priority = initial?.priority ?? 100
    form.is_active = initial?.is_active ?? true
  },
  { immediate: true },
)

const showValidation = ref(false)

watch(
  () => props.open,
  (open) => {
    if (open) {
      showValidation.value = false
    }
  },
)

function buildLocalErrors(): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!form.keyword.trim()) {
    errors.keyword = 'Informe a palavra ou frase-chave.'
  }
  if (!form.response_body.trim()) {
    errors.response_body = 'Informe a mensagem de resposta.'
  }
  if (!Number.isFinite(form.priority)) {
    errors.priority = 'Prioridade inválida.'
  }
  return errors
}

const localErrors = computed(() => (showValidation.value ? buildLocalErrors() : {}))

const fieldError = (field: string): string | null => {
  return props.serverErrors?.[field] ?? localErrors.value[field] ?? null
}

useEscapeKey(
  () => props.open,
  () => emit('close'),
)

function onSubmit(): void {
  showValidation.value = true
  const errors = buildLocalErrors()
  if (Object.keys(errors).length > 0) {
    return
  }
  emit('submit', {
    keyword: form.keyword.trim(),
    response_body: form.response_body.trim(),
    match_type: form.match_type,
    priority: form.priority,
    is_active: form.is_active,
  })
}
</script>

<template>
  <UiModalLayer
    :open="open"
    z-class="z-50"
    align="sheet"
    labelled-by="keyword-rule-form-title"
    panel-class="max-w-lg"
    @close="emit('close')"
  >
    <div
      class="flex max-h-[min(92vh,720px)] w-full flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-xl sm:rounded-2xl"
    >
      <div class="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2 id="keyword-rule-form-title" class="font-display text-lg font-semibold text-brand-ink">
          {{ isEditing ? 'Editar regra' : 'Nova regra por palavra-chave' }}
        </h2>
        <p class="mt-1 text-sm text-brand-gray">
          Responda automaticamente quando a mensagem do cliente corresponder à regra.
        </p>
      </div>

      <form
        class="flex-1 space-y-4 overflow-y-auto px-5 py-4 sm:px-6"
        :aria-busy="saving || undefined"
        @submit.prevent="onSubmit"
      >
        <div class="space-y-1">
          <label class="text-sm font-medium text-brand-ink" for="keyword-rule-keyword">Palavra-chave</label>
          <UiInput
            id="keyword-rule-keyword"
            v-model="form.keyword"
            type="text"
            autocomplete="off"
            placeholder="Ex.: horário, endereço, cardápio"
            :invalid="Boolean(fieldError('keyword'))"
            @update:model-value="showValidation = false"
          />
          <p v-if="fieldError('keyword')" class="text-xs text-red-600">{{ fieldError('keyword') }}</p>
        </div>

        <MessageFieldMeta
          id="keyword-rule-message"
          v-model="form.response_body"
          label="Mensagem de resposta"
          :error="fieldError('response_body')"
          placeholder="Texto enviado automaticamente ao cliente."
        />

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-1">
            <label class="text-sm font-medium text-brand-ink" for="keyword-rule-match">Tipo de correspondência</label>
            <select id="keyword-rule-match" v-model="form.match_type" :class="uiSelectClass">
              <option value="contains">Contém o texto</option>
              <option value="exact">Texto exato</option>
            </select>
          </div>
          <div class="space-y-1">
            <label class="text-sm font-medium text-brand-ink" for="keyword-rule-priority">Prioridade</label>
            <input
              id="keyword-rule-priority"
              v-model.number="form.priority"
              type="number"
              min="0"
              step="1"
              :class="uiSelectClass"
              :aria-invalid="Boolean(fieldError('priority')) || undefined"
            />
            <p class="text-xs text-brand-gray">Menor número = maior prioridade na avaliação.</p>
            <p v-if="fieldError('priority')" class="text-xs text-red-600">{{ fieldError('priority') }}</p>
          </div>
        </div>

        <label class="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-brand-ink">
          <input
            v-model="form.is_active"
            type="checkbox"
            class="h-4 w-4 rounded border-slate-300 text-brand-indigo focus:ring-brand-indigo"
          />
          Regra ativa
        </label>
      </form>

      <div class="flex justify-end gap-2 border-t border-slate-100 px-5 py-4 sm:px-6">
        <UiButton type="button" variant="secondary" :disabled="saving" @click="emit('close')">
          Cancelar
        </UiButton>
        <UiButton type="button" variant="primary" :disabled="saving" @click="onSubmit">
          {{ saving ? 'Salvando…' : isEditing ? 'Salvar alterações' : 'Criar regra' }}
        </UiButton>
      </div>
    </div>
  </UiModalLayer>
</template>
