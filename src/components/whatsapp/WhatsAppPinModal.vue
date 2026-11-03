<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { UiButton, UiInput, UiModalLayer } from '@/components/ui'
import { useEscapeKey } from '@/composables/useEscapeKey'

const props = defineProps<{
  open: boolean
  loading?: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  close: []
  submit: [pin: string]
}>()

const pin = ref('')

const pinValid = computed(() => /^\d{6}$/.test(pin.value))

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      pin.value = ''
    }
  },
)

function onSubmit(): void {
  if (!pinValid.value) {
    return
  }
  emit('submit', pin.value)
}

useEscapeKey(
  () => props.open,
  () => emit('close'),
)
</script>

<template>
  <UiModalLayer :open="open" z-class="z-50" labelled-by="whatsapp-pin-title" @close="emit('close')">
    <div
      class="mx-auto max-h-[min(100dvh,90vh)] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6"
    >
      <h2 id="whatsapp-pin-title" class="font-display text-lg font-semibold text-brand-ink">
        Confirmar PIN do WhatsApp
      </h2>
      <p class="mt-2 text-sm text-brand-gray">
        Informe o PIN de 6 dígitos do número comercial para concluir a verificação na Meta.
      </p>

      <form class="mt-5" @submit.prevent="onSubmit">
        <label class="block text-sm font-medium text-brand-ink" for="whatsapp-pin"> PIN (6 dígitos) </label>
        <UiInput
          id="whatsapp-pin"
          v-model="pin"
          type="text"
          inputmode="numeric"
          autocomplete="one-time-code"
          :maxlength="6"
          pattern="[0-9]*"
          placeholder="••••••"
          :disabled="loading"
          input-class="text-center font-mono text-lg tracking-[0.3em]"
        />

        <p v-if="error" class="mt-3 text-sm text-red-600" role="alert">{{ error }}</p>

        <div class="mt-6 flex justify-end gap-2">
          <UiButton type="button" variant="secondary" :disabled="loading" @click="emit('close')">
            Cancelar
          </UiButton>
          <UiButton type="submit" variant="primary" :disabled="!pinValid || loading"> Conectar </UiButton>
        </div>
      </form>
    </div>
  </UiModalLayer>
</template>
