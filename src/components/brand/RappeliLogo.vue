<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'light' | 'dark'
    showWordmark?: boolean
  }>(),
  {
    variant: 'light',
    showWordmark: true,
  },
)
</script>

<template>
  <div class="flex items-center gap-2.5">
    <img src="/logo-mark.svg" alt="" class="h-9 w-9 shrink-0" width="36" height="36" />
    <span
      v-if="showWordmark"
      class="text-xl font-semibold tracking-tight"
      :class="variant === 'light' ? 'text-white' : 'text-slate-900'"
    >
      rappeli
    </span>
  </div>
</template>
