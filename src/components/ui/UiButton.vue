<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    type: 'button',
    disabled: false,
  },
)

const classes = computed(() => {
  const base =
    'inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-indigo disabled:pointer-events-none disabled:opacity-50'

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm',
  }

  const variants = {
    primary: 'bg-brand-indigo text-white hover:bg-brand-indigo-hover',
    secondary: 'border border-slate-200 bg-white text-brand-ink hover:bg-slate-50',
    outline: 'border border-slate-200 bg-white text-brand-indigo hover:bg-brand-mist',
    ghost: 'text-brand-gray hover:bg-slate-100 hover:text-brand-ink',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }

  return [base, sizes[props.size], variants[props.variant]].join(' ')
})
</script>

<template>
  <button :type="type" :disabled="disabled" :class="classes">
    <slot />
  </button>
</template>
