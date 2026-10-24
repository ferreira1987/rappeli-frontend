<script setup lang="ts">
const model = defineModel<boolean>({ required: true })

defineProps<{
  label: string
  description?: string
  disabled?: boolean
}>()
</script>

<template>
  <div class="flex items-start justify-between gap-4">
    <div class="min-w-0">
      <p class="text-sm font-medium text-brand-ink">{{ label }}</p>
      <p v-if="description" class="mt-0.5 text-xs text-brand-gray">{{ description }}</p>
    </div>
    <button
      type="button"
      role="switch"
      class="relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-indigo disabled:opacity-50"
      :class="model ? 'bg-brand-indigo' : 'bg-slate-200'"
      :aria-checked="model"
      :disabled="disabled"
      @click="model = !model"
    >
      <span
        class="pointer-events-none inline-block h-6 w-6 translate-y-0.5 rounded-full bg-white shadow transition-transform"
        :class="model ? 'translate-x-5' : 'translate-x-0.5'"
        aria-hidden="true"
      />
    </button>
  </div>
</template>
