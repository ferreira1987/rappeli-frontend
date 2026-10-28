<script setup lang="ts">
import { GripVertical, MessageSquare, Trash2 } from '@lucide/vue'
import { RouterLink } from 'vue-router'

import type { FunnelCard } from '@/types/funnel'
import { formatBrazilPhone } from '@/utils/phone'

const props = defineProps<{
  card: FunnelCard
  stageId: number
  dragging: boolean
  keyboardGrabbed: boolean
  dragDisabled: boolean
}>()

const emit = defineEmits<{
  delete: [card: FunnelCard]
  dragStart: [card: FunnelCard, event: DragEvent]
  dragEnd: []
  gripPointerDown: [card: FunnelCard, event: PointerEvent]
  gripKeydown: [card: FunnelCard, stageId: number, event: KeyboardEvent]
}>()

function onDragStart(event: DragEvent): void {
  const target = event.target as HTMLElement | null
  if (!target?.closest('[data-funnel-grip]')) {
    event.preventDefault()
    return
  }
  emit('dragStart', props.card, event)
}
</script>

<template>
  <article
    :data-funnel-card="card.id"
    :data-funnel-card-id="card.id"
    class="rounded-xl border border-slate-200 bg-white p-3 shadow-xs transition-shadow"
    :class="{
      'opacity-60 ring-2 ring-brand-indigo/40': dragging,
      'ring-2 ring-brand-indigo': keyboardGrabbed,
    }"
    :draggable="!dragDisabled"
    @dragstart="onDragStart"
    @dragend="emit('dragEnd')"
  >
    <div class="flex items-start gap-1.5">
      <button
        type="button"
        class="mt-0.5 shrink-0 cursor-grab touch-none rounded p-0.5 text-brand-gray hover:bg-slate-100 active:cursor-grabbing"
        :class="{ 'cursor-grabbing': dragging }"
        :aria-grabbed="keyboardGrabbed || dragging ? 'true' : 'false'"
        :aria-label="`Mover card de ${card.contact_name || 'contato'}. Espaço para pegar; setas para posicionar; Enter para soltar; Esc para cancelar.`"
        data-funnel-grip
        :disabled="dragDisabled"
        @pointerdown="emit('gripPointerDown', card, $event)"
        @keydown="emit('gripKeydown', card, stageId, $event)"
        @click.prevent
      >
        <GripVertical class="h-4 w-4" />
      </button>
      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-2">
          <p class="text-sm font-semibold text-brand-ink">{{ card.contact_name || 'Contato' }}</p>
          <button
            type="button"
            class="rounded p-1 text-brand-gray hover:bg-red-50 hover:text-red-600"
            aria-label="Excluir card"
            @click="emit('delete', card)"
          >
            <Trash2 class="h-3.5 w-3.5" />
          </button>
        </div>
        <p v-if="card.phone" class="mt-0.5 flex items-center gap-1 text-[11px] text-brand-gray">
          <MessageSquare class="h-3 w-3" />
          {{ formatBrazilPhone(card.phone) || card.phone }}
        </p>
        <p v-if="card.last_message" class="mt-2 line-clamp-2 text-xs text-brand-gray">{{ card.last_message }}</p>
        <div v-if="card.tags?.length" class="mt-2 flex flex-wrap gap-1">
          <span
            v-for="tag in card.tags"
            :key="tag"
            class="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
          >
            {{ tag }}
          </span>
        </div>
        <div class="mt-3 flex justify-end border-t border-slate-100 pt-2">
          <RouterLink
            v-if="card.conversation_id"
            :to="{ name: 'conversas', query: { conversation: card.conversation_id } }"
            class="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-indigo hover:underline"
          >
            <MessageSquare class="h-3 w-3" />
            Abrir conversa
          </RouterLink>
        </div>
      </div>
    </div>
  </article>
</template>
