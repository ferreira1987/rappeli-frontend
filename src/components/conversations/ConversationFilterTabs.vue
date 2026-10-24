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
  <div class="scrollbar-none overflow-x-auto px-4 pb-2">
    <div class="flex min-w-max gap-1 rounded-xl bg-slate-100 p-1 text-xs font-semibold">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 transition"
        :class="
          active === tab.id
            ? 'bg-white text-brand-indigo shadow-xs'
            : 'text-brand-gray hover:text-brand-ink'
        "
        @click="onSelect(tab.id)"
      >
        {{ tab.label }}
        <span
          class="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
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
