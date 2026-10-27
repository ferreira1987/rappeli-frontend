<script setup lang="ts">
import { ListOrdered, X } from '@lucide/vue'
import { computed, ref, watch } from 'vue'

import { useEscapeKey } from '@/composables/useEscapeKey'
import type { SequenceStep } from '@/types/campaigns'

export type SequenceStepKind = 'message' | 'wait' | 'condition'

const props = defineProps<{
  open: boolean
  submitting?: boolean
  step?: SequenceStep | null
  serverFieldErrors?: Record<string, string>
  formError?: string | null
}>()

const emit = defineEmits<{
  close: []
  save: [payload: {
    kind: SequenceStepKind
    label: string | null
    preview: string | null
    wait_minutes: number | null
    message_template_id: number | null
  }]
}>()

const kind = ref<SequenceStepKind>('wait')
const label = ref('')
const preview = ref('')
const waitMinutes = ref(0)
const messageTemplateId = ref<number | null>(null)
const fieldErrors = ref<Record<string, string>>({})

const kindOptions: { value: SequenceStepKind; label: string }[] = [
  { value: 'wait', label: 'Aguardar' },
  { value: 'message', label: 'Mensagem' },
  { value: 'condition', label: 'Condição' },
]

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    kind.value = (props.step?.kind as SequenceStepKind) ?? 'wait'
    label.value = props.step?.label ?? ''
    preview.value = props.step?.preview ?? ''
    waitMinutes.value = props.step?.wait_minutes ?? 0
    messageTemplateId.value = props.step?.message_template_id ?? null
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
  if (kind.value === 'wait' && waitMinutes.value < 0) {
    fieldErrors.value.wait_minutes = 'Informe minutos válidos.'
    return
  }
  emit('save', {
    kind: kind.value,
    label: label.value.trim() || null,
    preview: preview.value.trim() || null,
    wait_minutes: kind.value === 'wait' ? waitMinutes.value : null,
    message_template_id: kind.value === 'message' ? messageTemplateId.value : null,
  })
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sequence-step-title"
      @click.self="onClose"
    >
      <form
        class="flex w-full max-w-lg flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-2xl"
        @submit.prevent="onSubmit"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-2">
            <ListOrdered class="h-5 w-5 text-brand-indigo" aria-hidden="true" />
            <h2 id="sequence-step-title" class="font-display text-lg font-bold text-brand-ink">
              {{ step ? 'Editar passo' : 'Novo passo' }}
            </h2>
          </div>
          <button type="button" class="rounded-lg p-1.5 text-brand-gray hover:bg-slate-100" aria-label="Fechar" @click="onClose">
            <X class="h-5 w-5" />
          </button>
        </div>

        <p v-if="formError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {{ formError }}
        </p>

        <div>
          <label class="mb-1 block text-xs font-semibold text-brand-ink" for="step-kind">Tipo *</label>
          <select id="step-kind" v-model="kind" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option v-for="opt in kindOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>

        <div>
          <label class="mb-1 block text-xs font-semibold text-brand-ink" for="step-label">Rótulo</label>
          <input id="step-label" v-model="label" type="text" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </div>

        <div v-if="kind === 'wait'">
          <label class="mb-1 block text-xs font-semibold text-brand-ink" for="step-wait">Aguardar (minutos)</label>
          <input
            id="step-wait"
            v-model.number="waitMinutes"
            type="number"
            min="0"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <p v-if="displayFieldErrors.wait_minutes" class="mt-1 text-xs text-red-600">{{ displayFieldErrors.wait_minutes }}</p>
        </div>

        <div v-if="kind === 'message'">
          <label class="mb-1 block text-xs font-semibold text-brand-ink" for="step-template">ID do template</label>
          <input
            id="step-template"
            v-model.number="messageTemplateId"
            type="number"
            min="1"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Opcional"
          />
          <p v-if="displayFieldErrors.message_template_id" class="mt-1 text-xs text-red-600">
            {{ displayFieldErrors.message_template_id }}
          </p>
        </div>

        <div>
          <label class="mb-1 block text-xs font-semibold text-brand-ink" for="step-preview">Prévia / notas</label>
          <textarea
            id="step-preview"
            v-model="preview"
            rows="3"
            class="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <div class="flex justify-end gap-2 border-t border-slate-100 pt-2">
          <button type="button" class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium" @click="onClose">
            Cancelar
          </button>
          <button
            type="submit"
            class="rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            :disabled="submitting"
          >
            {{ submitting ? 'Salvando…' : 'Salvar passo' }}
          </button>
        </div>
      </form>
    </div>
  </Teleport>
</template>
