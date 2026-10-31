<script setup lang="ts">
import { ArrowLeft, ArrowRight } from '@lucide/vue'

defineProps<{
  primaryLabel: string
  primaryDisabled?: boolean
  primaryLoading?: boolean
  showBack?: boolean
  /** Stitch v5: resumo à esquerda com rótulo RESUMO DA SELEÇÃO */
  summaryLayout?: 'default' | 'v5'
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
    data-onboarding-action-bar
  >
    <div
      class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 md:px-8"
      :class="summaryLayout === 'v5' ? 'flex-col sm:flex-row sm:items-center' : ''"
    >
      <button
        v-if="showBack !== false && summaryLayout !== 'v5'"
        type="button"
        class="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        @click="emit('back')"
      >
        <ArrowLeft class="h-4 w-4" aria-hidden="true" />
        Voltar
      </button>
      <div v-else-if="summaryLayout !== 'v5'" class="flex-1" />

      <div
        v-if="summaryLayout === 'v5'"
        class="w-full min-w-0 flex-1 text-left sm:w-auto"
      >
        <slot name="summary" />
      </div>

      <div
        class="flex w-full items-center gap-4 sm:w-auto"
        :class="summaryLayout === 'v5' ? 'justify-end sm:shrink-0' : 'flex-1 justify-end'"
      >
        <slot v-if="summaryLayout !== 'v5'" name="summary" />
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-md transition disabled:opacity-60"
          :class="
            summaryLayout === 'v5'
              ? 'bg-[#4338CA] hover:bg-brand-indigo-hover'
              : 'bg-brand-indigo hover:bg-brand-indigo-hover'
          "
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
