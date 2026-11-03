<script setup lang="ts">
import { UiButton, UiModalLayer } from '@/components/ui'
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
  <UiModalLayer
    :open="open"
    z-class="z-50"
    role="alertdialog"
    labelled-by="whatsapp-disconnect-title"
    described-by="whatsapp-disconnect-message"
    @close="emit('close')"
  >
    <div class="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6">
      <h2 id="whatsapp-disconnect-title" class="font-display text-lg font-semibold text-brand-ink">
        Desconectar WhatsApp?
      </h2>
      <p id="whatsapp-disconnect-message" class="mt-2 text-sm text-brand-gray">
        O número deixará de enviar e receber mensagens pelo Rappeli até você conectar novamente.
      </p>
      <div class="mt-6 flex justify-end gap-2">
        <UiButton type="button" variant="secondary" :disabled="loading" @click="emit('close')">
          Cancelar
        </UiButton>
        <UiButton type="button" variant="danger" :disabled="loading" @click="emit('confirm')">
          Desconectar
        </UiButton>
      </div>
    </div>
  </UiModalLayer>
</template>
