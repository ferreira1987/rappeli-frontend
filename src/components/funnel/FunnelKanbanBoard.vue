<script setup lang="ts">
import { computed } from 'vue'

import FunnelKanbanCard from '@/components/funnel/FunnelKanbanCard.vue'
import { useFunnelKanbanDnD } from '@/composables/useFunnelKanbanDnD'
import type { FunnelCard, FunnelStage } from '@/types/funnel'

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

function stageDotClass(stage: FunnelStage): string {
  if (stage.color?.includes('emerald')) return 'bg-emerald-500'
  if (stage.color?.includes('amber')) return 'bg-amber-500'
  if (stage.color?.includes('violet')) return 'bg-violet-500'
  return 'bg-brand-indigo'
}
</script>

<template>
  <div>
    <p class="sr-only" aria-live="polite" aria-atomic="true">{{ liveAnnouncement }}</p>

    <div class="flex min-h-[420px] gap-4">
      <div
        v-for="stage in stages"
        :key="stage.id"
        class="flex w-[min(100%,280px)] shrink-0 flex-col rounded-xl border border-slate-200/80 bg-white/80 transition-shadow"
        :class="{
          'ring-2 ring-brand-indigo/30': dropPreview?.stageId === stage.id && draggedCardId != null,
        }"
        data-funnel-column
        :data-funnel-column-id="stage.id"
      >
        <div class="flex items-center gap-2 border-b border-slate-100 px-3 py-3">
          <span class="h-2 w-2 rounded-full" :class="stageDotClass(stage)" />
          <h2 class="text-sm font-semibold text-brand-ink">{{ stage.title }}</h2>
          <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-brand-gray">
            {{ cardsByStage.get(stage.id)?.length ?? 0 }}
          </span>
          <slot name="stage-actions" :stage="stage" />
        </div>
        <div class="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
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
      class="pointer-events-none fixed z-[70] rounded-xl border border-brand-indigo/40 bg-white/95 px-3 py-2 text-sm font-semibold text-brand-ink shadow-lg"
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
