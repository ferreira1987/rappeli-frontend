<script setup lang="ts">
import { AlertTriangle, X } from '@lucide/vue'

import { UiButton, UiIconButton } from '@/components/ui'
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
          <UiIconButton type="button" ariaLabel="Fechar" @click="onClose">
            <X class="h-5 w-5" aria-hidden="true" />
          </UiIconButton>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <UiButton type="button" variant="secondary" :disabled="loading" @click="onClose">
            {{ cancelLabel }}
          </UiButton>
          <UiButton
            type="button"
            :variant="variant === 'danger' ? 'danger' : 'primary'"
            :disabled="loading"
            @click="onConfirm"
          >
            {{ loading ? 'Aguarde…' : confirmLabel }}
          </UiButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>
