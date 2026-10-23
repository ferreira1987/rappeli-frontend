<script setup lang="ts">
import { Info } from '@lucide/vue'

withDefaults(
  defineProps<{
    message?: string
  }>(),
  {
    message: 'Visualização de exemplo — conteúdo ilustrativo, sem dados reais da API.',
  },
)
</script>

<template>
  <div
    class="flex items-start gap-2 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-900"
    role="status"
  >
    <Info class="mt-0.5 h-4 w-4 shrink-0 text-sky-600" aria-hidden="true" />
    <p>{{ message }}</p>
  </div>
</template>
