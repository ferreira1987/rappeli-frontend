<script setup lang="ts">
import { AlertTriangle, X } from '@lucide/vue'

import { useEscapeKey } from '@/composables/useEscapeKey'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: 'danger' | 'primary'
    loading?: boolean
  }>(),
  {
    confirmLabel: 'Confirmar',
    cancelLabel: 'Cancelar',
    variant: 'danger',
    loading: false,
  },
)

const emit = defineEmits<{
  close: []
  confirm: []
}>()

function onClose(): void {
  emit('close')
}

function onConfirm(): void {
  emit('confirm')
}

useEscapeKey(
  () => props.open,
  () => onClose(),
)
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-message"
      @click.self="onClose"
    >
      <div class="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-start gap-3">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              :class="variant === 'danger' ? 'bg-red-50 text-red-600' : 'bg-brand-mist text-brand-indigo'"
            >
              <AlertTriangle class="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="confirm-modal-title" class="font-display text-lg font-bold text-brand-ink">{{ title }}</h2>
              <p id="confirm-modal-message" class="mt-2 text-sm text-brand-gray">{{ message }}</p>
            </div>
          </div>
          <button
            type="button"
            class="rounded-lg p-1.5 text-brand-gray hover:bg-slate-100"
            aria-label="Fechar"
            @click="onClose"
          >
            <X class="h-5 w-5" />
          </button>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <button
            type="button"
            class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-brand-ink hover:bg-slate-50"
            :disabled="loading"
            @click="onClose"
          >
            {{ cancelLabel }}
          </button>
          <button
            type="button"
            class="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            :class="variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-indigo hover:bg-brand-indigo-hover'"
            :disabled="loading"
            @click="onConfirm"
          >
            {{ loading ? 'Aguarde…' : confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
