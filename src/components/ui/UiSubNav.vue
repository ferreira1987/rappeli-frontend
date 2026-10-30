<script setup lang="ts" generic="T extends string">
import type { Component } from 'vue'

defineProps<{
  items: { key: T; label: string; hint?: string; icon?: Component }[]
  active: T
}>()

const emit = defineEmits<{
  select: [key: T]
}>()

function onSelect(key: T): void {
  emit('select', key)
}
</script>

<template>
  <nav
    class="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r lg:py-6 lg:px-4"
    aria-label="Seções"
  >
    <p class="mb-3 hidden px-2 text-[10px] font-semibold uppercase tracking-wider text-brand-gray lg:block">
      Preferências
    </p>
    <ul class="flex flex-col gap-1">
      <li v-for="item in items" :key="item.key" class="min-w-0">
        <button
          type="button"
          class="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2.5 text-left text-sm font-medium transition-colors"
          :class="
            active === item.key
              ? 'bg-brand-mist text-brand-indigo'
              : 'text-brand-gray hover:bg-slate-50 hover:text-brand-ink'
          "
          :aria-current="active === item.key ? 'page' : undefined"
          @click="onSelect(item.key)"
        >
          <component
            :is="item.icon"
            v-if="item.icon"
            class="mt-0.5 h-[18px] w-[18px] shrink-0"
            :class="active === item.key ? 'text-brand-indigo' : 'text-brand-gray'"
            aria-hidden="true"
          />
          <span class="min-w-0 flex-1">
            <span class="block truncate">{{ item.label }}</span>
            <span v-if="item.hint" class="mt-0.5 block truncate text-xs font-normal text-brand-gray">
              {{ item.hint }}
            </span>
          </span>
        </button>
      </li>
    </ul>
  </nav>
</template>
