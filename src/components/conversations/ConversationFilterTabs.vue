<script setup lang="ts">
import type { ConversationFilterTab } from '@/utils/conversationFilters'

const props = defineProps<{
  active: ConversationFilterTab
  counts: Record<ConversationFilterTab, number>
}>()

const emit = defineEmits<{
  change: [tab: ConversationFilterTab]
}>()

const tabs: { id: ConversationFilterTab; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'unread', label: 'Não lidas' },
  { id: 'automation', label: 'Automação' },
  { id: 'human', label: 'Humano' },
]

function onSelect(tab: ConversationFilterTab): void {
  if (tab !== props.active) {
    emit('change', tab)
  }
}
</script>

<template>
  <div class="px-3 pb-2 sm:px-4">
    <div
      class="grid w-full grid-cols-4 gap-0.5 rounded-xl bg-slate-100 p-0.5 text-[10px] font-semibold leading-tight sm:gap-1 sm:p-1 sm:text-xs"
      role="tablist"
      aria-label="Filtrar conversas"
    >
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        role="tab"
        :aria-selected="active === tab.id"
        class="flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg px-0.5 py-1.5 transition sm:flex-row sm:gap-1 sm:px-1.5"
        :class="
          active === tab.id
            ? 'bg-white text-brand-indigo shadow-xs'
            : 'text-brand-gray hover:text-brand-ink'
        "
        @click="onSelect(tab.id)"
      >
        <span class="max-w-full truncate text-center">{{ tab.label }}</span>
        <span
          class="shrink-0 rounded-full px-1 py-px text-[9px] font-bold sm:px-1.5 sm:text-[10px]"
          :class="
            tab.id === 'unread' && counts.unread > 0
              ? 'bg-brand-coral/20 text-brand-ink'
              : 'opacity-75'
          "
        >
          {{ counts[tab.id] }}
        </span>
      </button>
    </div>
  </div>
</template>
