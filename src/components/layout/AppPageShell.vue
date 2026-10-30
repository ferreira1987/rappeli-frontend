<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

import AppPageHeader from '@/components/app/AppPageHeader.vue'

defineProps<{
  title: string
  subtitle?: string
  breadcrumbs?: { label: string; to?: RouteLocationRaw }[]
  showExampleBadge?: boolean
  /** Full-bleed inbox layouts: skip page header and fill parent height. */
  flush?: boolean
}>()
</script>

<template>
  <div
    class="flex flex-col bg-brand-surface"
    :class="flush ? 'h-full min-h-0' : 'min-h-full'"
  >
    <AppPageHeader
      v-if="!flush"
      :title="title"
      :subtitle="subtitle"
      :breadcrumbs="breadcrumbs"
      :show-example-badge="showExampleBadge"
    >
      <template v-if="$slots.badges" #badges>
        <slot name="badges" />
      </template>
      <template v-if="$slots.actions" #actions>
        <slot name="actions" />
      </template>
    </AppPageHeader>

    <slot name="toolbar" />

    <div class="min-h-0 flex-1">
      <slot />
    </div>
  </div>
</template>
