<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string
  }>(),
  {
    label: 'Filtros',
  },
)
</script>

<template>
  <div
    class="border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8"
    role="group"
    :aria-label="label"
  >
    <div class="flex flex-wrap gap-2">
      <slot />
    </div>
  </div>
</template>
