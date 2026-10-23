<script setup lang="ts">
import { computed, ref, watch } from 'vue'

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
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-brand-ink/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="whatsapp-pin-title"
      @click.self="emit('close')"
    >
      <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <h2 id="whatsapp-pin-title" class="font-display text-lg font-semibold text-brand-ink">
          Confirmar PIN do WhatsApp
        </h2>
        <p class="mt-2 text-sm text-brand-gray">
          Informe o PIN de 6 dígitos do número comercial para concluir a verificação na Meta.
        </p>

        <label class="mt-5 block text-sm font-medium text-brand-ink" for="whatsapp-pin">
          PIN (6 dígitos)
        </label>
        <input
          id="whatsapp-pin"
          v-model="pin"
          type="text"
          inputmode="numeric"
          autocomplete="one-time-code"
          maxlength="6"
          pattern="[0-9]*"
          class="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-center font-mono text-lg tracking-[0.3em] focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
          placeholder="••••••"
          :disabled="loading"
          @keyup.enter="onSubmit"
        />

        <p v-if="error" class="mt-3 text-sm text-red-600" role="alert">{{ error }}</p>

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
            class="rounded-xl bg-brand-indigo px-4 py-2 text-sm font-semibold text-white hover:bg-brand-indigo-hover disabled:opacity-50"
            :disabled="!pinValid || loading"
            @click="onSubmit"
          >
            Conectar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
