<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

import ExampleDataBadge from '@/components/app/ExampleDataBadge.vue'

defineProps<{
  title: string
  subtitle?: string
  breadcrumbs?: { label: string; to?: RouteLocationRaw }[]
  showExampleBadge?: boolean
}>()
</script>

<template>
  <header
    class="flex shrink-0 flex-col gap-4 border-b border-slate-200/80 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"
  >
    <div class="min-w-0">
      <nav
        v-if="breadcrumbs?.length"
        class="mb-1 flex flex-wrap items-center gap-1.5 text-xs font-medium text-brand-gray"
        aria-label="Breadcrumb"
      >
        <template v-for="(crumb, index) in breadcrumbs" :key="`${crumb.label}-${index}`">
          <RouterLink v-if="crumb.to" :to="crumb.to" class="hover:text-brand-indigo">
            {{ crumb.label }}
          </RouterLink>
          <span v-else class="text-brand-ink">{{ crumb.label }}</span>
          <span v-if="index < breadcrumbs.length - 1" class="text-slate-300" aria-hidden="true">›</span>
        </template>
      </nav>
      <div v-if="$slots.badges" class="mb-2 flex flex-wrap items-center gap-2">
        <slot name="badges" />
      </div>
      <div class="flex flex-wrap items-center gap-2.5">
        <h1 class="text-xl font-bold tracking-tight text-brand-ink sm:text-2xl">
          {{ title }}
        </h1>
        <ExampleDataBadge v-if="showExampleBadge" />
      </div>
      <p v-if="subtitle" class="mt-1 max-w-2xl text-sm text-brand-gray">
        {{ subtitle }}
      </p>
    </div>
    <div v-if="$slots.actions" class="flex flex-wrap items-center gap-2">
      <slot name="actions" />
    </div>
  </header>
</template>
