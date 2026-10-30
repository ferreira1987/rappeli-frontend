<script setup lang="ts">
import type { ConversationFilterTab } from '@/utils/conversationFilters'

const props = defineProps<{
  active: ConversationFilterTab
  counts: Record<ConversationFilterTab, number>
}>()

const emit = defineEmits<{
  change: [tab: ConversationFilterTab]
}>()

const filters: { id: ConversationFilterTab; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'unread', label: 'Não lidas' },
  { id: 'automation', label: 'Automáticas' },
  { id: 'human', label: 'Humanas' },
]

function onSelect(tab: ConversationFilterTab): void {
  if (tab !== props.active) {
    emit('change', tab)
  }
}

function chipClasses(tab: ConversationFilterTab): string {
  const base =
    'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-indigo'
  if (props.active === tab) {
    return `${base} border-indigo-200 bg-brand-mist font-semibold text-brand-indigo`
  }
  return `${base} border-transparent bg-slate-100 text-slate-600 hover:bg-slate-200/80`
}

function countBadgeClasses(tab: ConversationFilterTab): string {
  if (props.active === tab) {
    return 'rounded-full border border-indigo-200 bg-white px-1.5 text-[10px] font-bold text-brand-indigo'
  }
  return 'rounded-full bg-white/80 px-1.5 text-[10px] font-bold text-brand-gray'
}

function showCount(tab: ConversationFilterTab): boolean {
  const count = props.counts[tab] ?? 0
  return tab === 'all' || tab === 'unread' || count > 0
}
</script>

<template>
  <div
    class="flex flex-wrap gap-1.5 overflow-x-auto scrollbar-none"
    role="group"
    aria-label="Filtrar conversas"
  >
    <button
      v-for="filter in filters"
      :key="filter.id"
      type="button"
      :class="chipClasses(filter.id)"
      :aria-pressed="active === filter.id"
      @click="onSelect(filter.id)"
    >
      {{ filter.label }}
      <span v-if="showCount(filter.id)" :class="countBadgeClasses(filter.id)">
        {{ counts[filter.id] ?? 0 }}
      </span>
    </button>
  </div>
</template>
