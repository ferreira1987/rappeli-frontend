<script setup lang="ts">
import { ListPlus, X } from '@lucide/vue'
import { ref, watch } from 'vue'

import { useEscapeKey } from '@/composables/useEscapeKey'

const props = defineProps<{
  open: boolean
  submitting?: boolean
}>()

const emit = defineEmits<{
  close: []
  create: [name: string]
}>()

const name = ref('')
const fieldError = ref<string | null>(null)

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    name.value = ''
    fieldError.value = null
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
    fieldError.value = 'Informe o nome da sequência.'
    return
  }
  fieldError.value = null
  emit('create', trimmed)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-sequence-title"
      @click.self="onClose"
    >
      <form
        class="flex w-full max-w-md flex-col gap-5 rounded-xl border border-slate-200 bg-white p-6 shadow-2xl"
        @submit.prevent="onSubmit"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 id="create-sequence-title" class="font-display text-lg font-bold text-brand-ink">
              Nova sequência
            </h2>
            <p class="mt-0.5 text-xs text-brand-gray">Dê um nome para identificar esta sequência de mensagens.</p>
          </div>
          <button
            type="button"
            class="rounded-lg p-1.5 text-brand-gray hover:bg-slate-100 hover:text-brand-ink"
            aria-label="Fechar"
            @click="onClose"
          >
            <X class="h-5 w-5" />
          </button>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-brand-ink" for="sequence-name">Nome *</label>
          <input
            id="sequence-name"
            v-model="name"
            type="text"
            autocomplete="off"
            placeholder="Ex.: Boas-vindas novos leads"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <p v-if="fieldError" class="mt-1 text-xs text-red-600">{{ fieldError }}</p>
        </div>

        <div class="flex justify-end gap-2 border-t border-slate-100 pt-2">
          <button
            type="button"
            class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-brand-ink hover:bg-slate-50"
            @click="onClose"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="inline-flex items-center gap-2 rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white hover:bg-brand-indigo-hover disabled:opacity-60"
            :disabled="submitting"
          >
            <ListPlus class="h-4 w-4" />
            {{ submitting ? 'Criando…' : 'Criar sequência' }}
          </button>
        </div>
      </form>
    </div>
  </Teleport>
</template>
