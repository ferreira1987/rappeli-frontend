<script setup lang="ts">
import { Building2, X } from '@lucide/vue'
import { ref, watch } from 'vue'

import { UiButton, UiIconButton, UiInput } from '@/components/ui'
import { uiTextareaClass } from '@/components/ui/uiSelectClass'
import { useEscapeKey } from '@/composables/useEscapeKey'
import type { Sector } from '@/types/team'

const props = defineProps<{
  open: boolean
  submitting?: boolean
  sector?: Sector | null
}>()

const emit = defineEmits<{
  close: []
  save: [payload: { name: string; description: string | null }]
}>()

const name = ref('')
const description = ref('')
const fieldErrors = ref<Record<string, string>>({})

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    name.value = props.sector?.name ?? ''
    description.value = props.sector?.description ?? ''
    fieldErrors.value = {}
  },
)

function onClose(): void {
  emit('close')
}

useEscapeKey(
  () => props.open,
  () => onClose(),
)

function onSubmit(): void {
  const trimmed = name.value.trim()
  if (!trimmed) {
    fieldErrors.value = { name: 'Informe o nome do setor.' }
    return
  }
  fieldErrors.value = {}
  emit('save', { name: trimmed, description: description.value.trim() || null })
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sector-form-title"
      @click.self="onClose"
    >
      <form
        class="flex w-full max-w-md flex-col gap-5 rounded-xl border border-slate-200 bg-white p-6 shadow-2xl"
        :aria-busy="submitting || undefined"
        @submit.prevent="onSubmit"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-2">
            <Building2 class="h-5 w-5 text-brand-indigo" aria-hidden="true" />
            <h2 id="sector-form-title" class="font-display text-lg font-bold text-brand-ink">
              {{ sector ? 'Editar setor' : 'Novo setor' }}
            </h2>
          </div>
          <UiIconButton type="button" ariaLabel="Fechar" @click="onClose">
            <X class="h-5 w-5" aria-hidden="true" />
          </UiIconButton>
        </div>

        <div class="space-y-1">
          <label class="block text-sm font-medium text-brand-ink" for="sector-name">Nome *</label>
          <UiInput
            id="sector-name"
            v-model="name"
            type="text"
            :disabled="sector?.is_default"
            :invalid="Boolean(fieldErrors.name)"
          />
          <p v-if="sector?.is_default" class="text-xs text-brand-gray">
            O setor padrão não pode ser renomeado aqui.
          </p>
          <p v-if="fieldErrors.name" class="text-xs text-red-600">{{ fieldErrors.name }}</p>
        </div>

        <div class="space-y-1">
          <label class="block text-sm font-medium text-brand-ink" for="sector-description">Descrição</label>
          <textarea
            id="sector-description"
            v-model="description"
            rows="3"
            :class="`${uiTextareaClass} resize-none`"
            placeholder="Opcional"
          />
        </div>

        <div class="flex justify-end gap-2 border-t border-slate-100 pt-2">
          <UiButton type="button" variant="secondary" @click="onClose"> Cancelar </UiButton>
          <UiButton type="submit" variant="primary" :disabled="submitting">
            {{ submitting ? 'Salvando…' : 'Salvar' }}
          </UiButton>
        </div>
      </form>
    </div>
  </Teleport>
</template>
