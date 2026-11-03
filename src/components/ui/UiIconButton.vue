<script setup lang="ts">
import { computed, useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()

const filteredAttrs = computed(() => {
  const { class: _c, ...rest } = attrs
  return rest
})

const props = withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    /** Obrigatório — botões só com ícone precisam de nome acessível */
    ariaLabel: string
    variant?: 'ghost' | 'muted'
    size?: 'md' | 'sm'
  }>(),
  {
    type: 'button',
    disabled: false,
    variant: 'ghost',
    size: 'md',
  },
)

const classes = computed(() => {
  const base =
    'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg transition-[color,background-color,transform,opacity] duration-150 ease-out active:scale-[0.98] active:opacity-95 motion-reduce:transform-none motion-reduce:active:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-indigo disabled:pointer-events-none disabled:opacity-50'

  const sizes = {
    md: 'min-h-11 min-w-11',
    sm: 'min-h-9 min-w-9',
  }

  const variants = {
    ghost: 'text-brand-gray hover:bg-slate-100 hover:text-brand-ink',
    muted: 'text-slate-600 hover:bg-slate-200/80 hover:text-brand-ink',
  }

  return [base, sizes[props.size], variants[props.variant]].join(' ')
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="classes"
    :aria-label="ariaLabel"
    v-bind="filteredAttrs"
  >
    <slot />
  </button>
</template>
