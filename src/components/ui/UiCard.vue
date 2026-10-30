<script setup lang="ts">
withDefaults(
  defineProps<{
    padding?: 'none' | 'sm' | 'md' | 'lg'
    bordered?: boolean
  }>(),
  {
    padding: 'md',
    bordered: true,
  },
)

const paddingClass: Record<'none' | 'sm' | 'md' | 'lg', string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}
</script>

<template>
  <article
    class="rounded-lg bg-white shadow-xs"
    :class="[bordered ? 'border border-slate-200' : '', paddingClass[padding]]"
  >
    <header v-if="$slots.header" class="border-b border-slate-100 pb-4">
      <slot name="header" />
    </header>
    <slot />
    <footer v-if="$slots.footer" class="border-t border-slate-100 pt-4">
      <slot name="footer" />
    </footer>
  </article>
</template>
