<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    active?: boolean
    disabled?: boolean
  }>(),
  {
    active: false,
    disabled: false,
  },
)

const classes = computed(() => {
  const base =
    'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-indigo disabled:opacity-50'
  if (props.active) {
    return `${base} border-brand-indigo bg-brand-indigo text-white`
  }
  return `${base} border-slate-200 bg-white text-brand-gray hover:border-slate-300 hover:text-brand-ink`
})
</script>

<template>
  <button type="button" :disabled="disabled" :class="classes" :aria-pressed="active">
    <slot />
  </button>
</template>
