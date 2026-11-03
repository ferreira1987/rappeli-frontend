<script setup lang="ts">
import { UiButton, UiModalLayer } from '@/components/ui'
import { useEscapeKey } from '@/composables/useEscapeKey'

const props = defineProps<{
  open: boolean
  keyword?: string
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
    labelled-by="keyword-rule-delete-title"
    described-by="keyword-rule-delete-message"
    @close="emit('close')"
  >
    <div class="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6">
      <h2 id="keyword-rule-delete-title" class="font-display text-lg font-semibold text-brand-ink">
        Excluir regra?
      </h2>
      <p id="keyword-rule-delete-message" class="mt-2 text-sm text-brand-gray">
        A regra
        <span v-if="keyword" class="font-medium text-brand-ink">“{{ keyword }}”</span>
        será removida permanentemente. Esta ação não pode ser desfeita.
      </p>
      <div class="mt-6 flex justify-end gap-2">
        <UiButton type="button" variant="secondary" :disabled="loading" @click="emit('close')">
          Cancelar
        </UiButton>
        <UiButton type="button" variant="danger" :disabled="loading" @click="emit('confirm')">
          Excluir
        </UiButton>
      </div>
    </div>
  </UiModalLayer>
</template>
