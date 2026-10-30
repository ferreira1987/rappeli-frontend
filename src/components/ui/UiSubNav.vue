<script setup lang="ts" generic="T extends string">
defineProps<{
  items: { key: T; label: string; hint?: string }[]
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
    class="border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:w-56 lg:shrink-0 lg:border-b-0 lg:border-r lg:py-6"
    aria-label="Seções"
  >
    <p class="mb-2 hidden px-2 text-[10px] font-semibold uppercase tracking-wider text-brand-gray lg:block">
      Preferências
    </p>
    <ul class="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
      <li v-for="item in items" :key="item.key" class="min-w-0">
        <button
          type="button"
          class="w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors lg:rounded-lg"
          :class="
            active === item.key
              ? 'bg-brand-mist text-brand-indigo'
              : 'text-brand-gray hover:bg-slate-50 hover:text-brand-ink'
          "
          :aria-current="active === item.key ? 'page' : undefined"
          @click="onSelect(item.key)"
        >
          <span class="block truncate">{{ item.label }}</span>
          <span v-if="item.hint" class="mt-0.5 block truncate text-xs font-normal text-brand-gray">
            {{ item.hint }}
          </span>
        </button>
      </li>
    </ul>
  </nav>
</template>
