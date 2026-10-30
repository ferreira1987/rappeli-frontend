<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'count'
    size?: 'sm' | 'md'
  }>(),
  {
    variant: 'neutral',
    size: 'sm',
  },
)

const classes = computed(() => {
  const base =
    'inline-flex items-center justify-center font-semibold whitespace-nowrap'

  const sizes = {
    sm: 'rounded-full px-2 py-0.5 text-[10px] leading-none',
    md: 'rounded-md px-2.5 py-1 text-xs',
  }

  const variants = {
    neutral: 'bg-slate-100 text-brand-gray',
    primary: 'bg-brand-mist text-brand-indigo',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-900 border border-amber-200',
    danger: 'bg-red-50 text-red-700 border border-red-200',
    count: 'min-h-5 min-w-5 bg-brand-indigo px-1 text-[10px] text-white',
  }

  return [base, sizes[props.size], variants[props.variant]].join(' ')
})
</script>

<template>
  <span :class="classes"><slot /></span>
</template>
