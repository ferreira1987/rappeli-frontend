<script setup lang="ts">
import type { ConversationFilterTab } from '@/utils/conversationFilters'

import UiFilterChip from '@/components/ui/UiFilterChip.vue'
import UiFilterChipGroup from '@/components/ui/UiFilterChipGroup.vue'

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
</script>

<template>
  <UiFilterChipGroup label="Filtrar conversas">
    <UiFilterChip
      v-for="filter in filters"
      :key="filter.id"
      :active="active === filter.id"
      @click="onSelect(filter.id)"
    >
      {{ filter.label }}
      <span
        v-if="counts[filter.id] > 0 || filter.id === 'unread'"
        class="rounded-full px-1.5 text-[10px] font-bold"
        :class="active === filter.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-brand-gray'"
      >
        {{ counts[filter.id] }}
      </span>
    </UiFilterChip>
  </UiFilterChipGroup>
</template>
