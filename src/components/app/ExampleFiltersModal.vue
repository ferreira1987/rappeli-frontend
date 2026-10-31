<script setup lang="ts">
import { X } from '@lucide/vue'

import { useEscapeKey } from '@/composables/useEscapeKey'

const props = defineProps<{
  open: boolean
  title: string
}>()

const emit = defineEmits<{
  close: []
  apply: []
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
      class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="`filters-${title}`"
      @click.self="emit('close')"
    >
      <div class="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div class="flex items-start justify-between gap-3">
          <h2 :id="`filters-${title}`" class="font-display text-lg font-bold text-brand-ink">
            {{ title }}
          </h2>
          <button
            type="button"
            class="rounded-lg p-1.5 text-brand-gray hover:bg-slate-100"
            aria-label="Fechar"
            @click="emit('close')"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
        <p class="mt-2 text-sm text-brand-gray">
          Filtros de exemplo — ajuste os campos e aplique para simular a ação no painel.
        </p>
        <label for="example-filter-period" class="mt-4 block text-xs font-semibold text-brand-ink"
          >Período</label
        >
        <select
          id="example-filter-period"
          class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option>Últimos 7 dias</option>
          <option>Últimos 30 dias</option>
        </select>
        <div class="mt-6 flex justify-end gap-2">
          <button
            type="button"
            class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50"
            @click="emit('close')"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white hover:bg-brand-indigo-hover"
            @click="emit('apply')"
          >
            Aplicar filtros
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
