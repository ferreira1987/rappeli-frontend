<script setup lang="ts">
import UiBadge from '@/components/ui/UiBadge.vue'
import UiFilterChip from '@/components/ui/UiFilterChip.vue'
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

function showCount(tab: ConversationFilterTab): boolean {
  const count = props.counts[tab] ?? 0
  return tab === 'all' || tab === 'unread' || count > 0
}
</script>

<template>
  <div
    class="flex flex-wrap gap-2 overflow-x-auto scrollbar-none"
    role="group"
    aria-label="Filtrar conversas"
  >
    <UiFilterChip
      v-for="filter in filters"
      :key="filter.id"
      :active="active === filter.id"
      @click="onSelect(filter.id)"
    >
      {{ filter.label }}
      <UiBadge
        v-if="showCount(filter.id)"
        :variant="'neutral'"
        size="sm"
        :class="active === filter.id ? '!bg-indigo-500/30 !text-white' : ''"
      >
        {{ counts[filter.id] ?? 0 }}
      </UiBadge>
    </UiFilterChip>
  </div>
</template>
