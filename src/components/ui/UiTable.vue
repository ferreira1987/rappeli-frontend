<script setup lang="ts">
withDefaults(
  defineProps<{
    compact?: boolean
  }>(),
  {
    compact: false,
  },
)
</script>

<template>
  <div class="overflow-x-auto rounded-lg border border-slate-200 bg-white">
    <table
      class="w-full text-left text-sm text-brand-ink"
      :class="compact ? '[&_th]:px-3 [&_td]:px-3' : '[&_th]:px-4 [&_td]:px-4'"
    >
      <slot />
    </table>
  </div>
</template>

<style scoped>
:deep(thead) {
  border-bottom: 1px solid rgb(226 232 240);
  background: rgb(248 250 252);
}

:deep(th) {
  padding-top: 0.625rem;
  padding-bottom: 0.625rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-brand-gray, #64748b);
}

:deep(tbody tr) {
  border-bottom: 1px solid rgb(241 245 249);
}

:deep(tbody tr:last-child) {
  border-bottom: none;
}

:deep(td) {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  vertical-align: middle;
}
</style>
