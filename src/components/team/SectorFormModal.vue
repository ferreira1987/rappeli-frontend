<script setup lang="ts">
import { Building2, X } from '@lucide/vue'
import { ref, watch } from 'vue'

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
        @submit.prevent="onSubmit"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-2">
            <Building2 class="h-5 w-5 text-brand-indigo" aria-hidden="true" />
            <h2 id="sector-form-title" class="font-display text-lg font-bold text-brand-ink">
              {{ sector ? 'Editar setor' : 'Novo setor' }}
            </h2>
          </div>
          <button type="button" class="rounded-lg p-1.5 text-brand-gray hover:bg-slate-100" aria-label="Fechar" @click="onClose">
            <X class="h-5 w-5" />
          </button>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-brand-ink" for="sector-name">Nome *</label>
          <input
            id="sector-name"
            v-model="name"
            type="text"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            :disabled="sector?.is_default"
          />
          <p v-if="sector?.is_default" class="mt-1 text-xs text-brand-gray">O setor padrão não pode ser renomeado aqui.</p>
          <p v-if="fieldErrors.name" class="mt-1 text-xs text-red-600">{{ fieldErrors.name }}</p>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-brand-ink" for="sector-description">Descrição</label>
          <textarea
            id="sector-description"
            v-model="description"
            rows="3"
            class="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Opcional"
          />
        </div>

        <div class="flex justify-end gap-2 border-t border-slate-100 pt-2">
          <button
            type="button"
            class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50"
            @click="onClose"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white hover:bg-brand-indigo-hover disabled:opacity-60"
            :disabled="submitting"
          >
            {{ submitting ? 'Salvando…' : 'Salvar' }}
          </button>
        </div>
      </form>
    </div>
  </Teleport>
</template>
