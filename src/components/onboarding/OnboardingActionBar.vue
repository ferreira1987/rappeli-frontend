<script setup lang="ts">
import { ArrowLeft, ArrowRight } from '@lucide/vue'

defineProps<{
  primaryLabel: string
  primaryDisabled?: boolean
  primaryLoading?: boolean
  showBack?: boolean
}>()

const emit = defineEmits<{
  back: []
  primary: []
}>()
</script>

<template>
  <aside
    class="sticky bottom-0 z-40 border-t border-slate-200 bg-white py-4 shadow-lg"
    aria-label="Ações do checkout"
  >
    <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 md:px-8">
      <button
        v-if="showBack !== false"
        type="button"
        class="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        @click="emit('back')"
      >
        <ArrowLeft class="h-4 w-4" aria-hidden="true" />
        Voltar
      </button>
      <div v-else class="flex-1" />

      <div class="flex flex-1 items-center justify-end gap-4">
        <slot name="summary" />
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg bg-brand-indigo px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-brand-indigo-hover disabled:opacity-60"
          :disabled="primaryDisabled || primaryLoading"
          @click="emit('primary')"
        >
          <span>{{ primaryLoading ? 'Aguarde…' : primaryLabel }}</span>
          <ArrowRight class="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  </aside>
</template>
