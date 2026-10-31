<script setup lang="ts">
withDefaults(
  defineProps<{
    /** light = wordmark for dark backgrounds; dark = ink wordmark on light UI */
    variant?: 'light' | 'dark'
    /** horizontal wordmark or symbol only */
    mode?: 'horizontal' | 'symbol'
    class?: string
  }>(),
  {
    variant: 'dark',
    mode: 'horizontal',
  },
)

const horizontalSrc = (variant: 'light' | 'dark') =>
  variant === 'light'
    ? '/brand/rappeli-A-horizontal-escuro.svg'
    : '/brand/rappeli-A-horizontal.svg'
</script>

<template>
  <img
    v-if="mode === 'horizontal'"
    :src="horizontalSrc(variant)"
    alt="Rappeli"
    class="h-8 w-auto max-w-[140px] object-contain object-left"
    :class="$props.class"
    width="140"
    height="32"
  />
  <img
    v-else
    src="/brand/rappeli-A-simbolo.svg"
    alt="Rappeli"
    class="h-9 w-9 shrink-0 object-contain"
    :class="$props.class"
    width="36"
    height="36"
  />
</template>
