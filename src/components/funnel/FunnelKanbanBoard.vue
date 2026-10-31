<script setup lang="ts">
import { computed } from 'vue'

import FunnelKanbanCard from '@/components/funnel/FunnelKanbanCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import { useFunnelKanbanDnD } from '@/composables/useFunnelKanbanDnD'
import type { FunnelCard, FunnelStage } from '@/types/funnel'
import { isFunnelWonStage } from '@/utils/funnelStage'

const props = defineProps<{
  stages: FunnelStage[]
  cardsByStage: Map<number, FunnelCard[]>
  dragDisabled?: boolean
}>()

const emit = defineEmits<{
  'update:stages': [stages: FunnelStage[]]
  deleteCard: [card: FunnelCard]
  status: [message: string | null]
}>()

const stagesModel = computed({
  get: () => props.stages,
  set: (value) => emit('update:stages', value),
})

const dragDisabledRef = computed(() => props.dragDisabled ?? false)

const {
  draggedCardId,
  dropPreview,
  keyboardGrab,
  moving,
  pointerGhost,
  liveAnnouncement,
  startPointerDrag,
  onGripKeydown,
  isDragging,
  isDropBefore,
  isDropAtEnd,
} = useFunnelKanbanDnD(stagesModel, {
  disabled: dragDisabledRef,
  onStatus: (message) => emit('status', message),
})
</script>

<template>
  <div>
    <p class="sr-only" aria-live="polite" aria-atomic="true">{{ liveAnnouncement }}</p>

    <div class="flex min-h-[420px] gap-4 pb-1">
      <div
        v-for="stage in stages"
        :key="stage.id"
        class="flex w-[min(100%,300px)] shrink-0 flex-col rounded-xl border border-slate-200/70 bg-slate-100/90 transition-shadow"
        :class="{
          'ring-2 ring-brand-indigo/30': dropPreview?.stageId === stage.id && draggedCardId != null,
        }"
        data-funnel-column
        :data-funnel-column-id="stage.id"
      >
        <div class="flex items-center gap-2 px-3 py-3">
          <h2 class="truncate text-sm font-bold text-brand-ink">{{ stage.title }}</h2>
          <UiBadge variant="neutral" size="sm">
            {{ cardsByStage.get(stage.id)?.length ?? 0 }}
          </UiBadge>
          <slot name="stage-actions" :stage="stage" />
        </div>
        <div class="flex flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2">
          <template v-for="(card, cardIndex) in cardsByStage.get(stage.id)" :key="card.id">
            <div
              v-if="isDropBefore(stage.id, cardIndex)"
              class="mx-1 h-0.5 rounded-full bg-brand-indigo"
              aria-hidden="true"
            />
            <FunnelKanbanCard
              :card="card"
              :stage-id="stage.id"
              :dragging="isDragging(card.id)"
              :keyboard-grabbed="keyboardGrab?.cardId === card.id"
              :drag-disabled="dragDisabled ?? false"
              :won-stage="isFunnelWonStage(stage)"
              @delete="emit('deleteCard', $event)"
              @grip-pointer-down="startPointerDrag"
              @grip-keydown="onGripKeydown"
            />
          </template>
          <div
            v-if="isDropAtEnd(stage.id, cardsByStage.get(stage.id)?.length ?? 0)"
            class="mx-1 h-0.5 rounded-full bg-brand-indigo"
            aria-hidden="true"
          />
          <p v-if="!(cardsByStage.get(stage.id)?.length)" class="py-6 text-center text-xs text-brand-gray">
            Solte cards aqui
          </p>
        </div>
      </div>
    </div>

    <div
      v-if="pointerGhost"
      class="pointer-events-none fixed z-[70] rounded-xl border border-brand-indigo/40 bg-white px-3 py-2 text-sm font-semibold text-brand-ink shadow-lg"
      :style="{
        left: `${pointerGhost.left}px`,
        top: `${pointerGhost.top}px`,
        width: `${pointerGhost.width}px`,
      }"
      aria-hidden="true"
    >
      {{ pointerGhost.label }}
    </div>

    <p v-if="moving" class="mt-2 text-xs text-brand-gray" role="status">Salvando posição…</p>
    <p v-if="dragDisabled" class="mt-2 text-xs text-brand-gray">
      Limpe a busca para reorganizar cards por arrastar e soltar.
    </p>
  </div>
</template>
