<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  title: string
  description: string
  icon?: Component
}>()
</script>

<template>
  <div
    class="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center"
  >
    <component
      :is="icon"
      v-if="icon"
      class="mb-4 h-10 w-10 text-slate-300"
      aria-hidden="true"
    />
    <h2 class="text-lg font-semibold text-slate-900">{{ title }}</h2>
    <p class="mt-2 max-w-md text-sm text-slate-500">{{ description }}</p>
  </div>
</template>
