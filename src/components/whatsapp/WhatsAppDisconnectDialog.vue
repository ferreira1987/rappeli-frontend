<script setup lang="ts">
import { useEscapeKey } from '@/composables/useEscapeKey'

const props = defineProps<{
  open: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()

useEscapeKey(
  () => props.open,
  () => emit('close'),
)
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-brand-ink/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="whatsapp-disconnect-title"
      @click.self="emit('close')"
    >
      <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6">
        <h2 id="whatsapp-disconnect-title" class="font-display text-lg font-semibold text-brand-ink">
          Desconectar WhatsApp?
        </h2>
        <p class="mt-2 text-sm text-brand-gray">
          O número deixará de enviar e receber mensagens pelo Rappeli até você conectar novamente.
        </p>
        <div class="mt-6 flex justify-end gap-2">
          <button
            type="button"
            class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-brand-gray hover:bg-slate-50"
            :disabled="loading"
            @click="emit('close')"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            :disabled="loading"
            @click="emit('confirm')"
          >
            Desconectar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
