<script setup lang="ts">
import { GripVertical, MessageSquare, Trash2 } from '@lucide/vue'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import UiBadge from '@/components/ui/UiBadge.vue'
import UiButton from '@/components/ui/UiButton.vue'
import { initialsFromName } from '@/composables/useInitials'
import type { FunnelCard } from '@/types/funnel'
import { formatRelativeConversationTime } from '@/utils/datetime'
import { funnelTagBadgeVariant } from '@/utils/funnelStage'
import { formatBrazilPhone } from '@/utils/phone'

const props = defineProps<{
  card: FunnelCard
  stageId: number
  dragging: boolean
  keyboardGrabbed: boolean
  dragDisabled: boolean
  wonStage?: boolean
}>()

const emit = defineEmits<{
  delete: [card: FunnelCard]
  gripPointerDown: [card: FunnelCard, event: PointerEvent]
  gripKeydown: [card: FunnelCard, stageId: number, event: KeyboardEvent]
}>()

const initials = computed(() => initialsFromName(props.card.contact_name))

const relativeUpdated = computed(() => {
  const iso = props.card.updated_at
  if (!iso) return null
  return formatRelativeConversationTime(iso)
})
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
  >
    <div class="flex items-start gap-2.5">
      <div
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
        :class="
          wonStage
            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
            : 'bg-slate-100 text-brand-gray ring-1 ring-slate-200/80'
        "
        aria-hidden="true"
      >
        {{ initials }}
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex items-start gap-1">
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-brand-ink">
              {{ card.contact_name || 'Contato' }}
            </p>
            <p v-if="card.phone" class="mt-0.5 truncate text-xs text-brand-gray">
              {{ formatBrazilPhone(card.phone) || card.phone }}
            </p>
          </div>
          <button
            type="button"
            class="shrink-0 cursor-grab touch-none rounded p-0.5 text-brand-gray hover:bg-slate-100 active:cursor-grabbing"
            :class="{ 'cursor-grabbing': dragging }"
            :aria-grabbed="keyboardGrabbed || dragging ? 'true' : 'false'"
            :aria-label="`Mover card de ${card.contact_name || 'contato'}. Arraste com o mouse ou toque na alça; Espaço e setas no teclado; Enter para soltar.`"
            data-funnel-grip
            :disabled="dragDisabled"
            @pointerdown="emit('gripPointerDown', card, $event)"
            @keydown="emit('gripKeydown', card, stageId, $event)"
            @click.prevent
          >
            <GripVertical class="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <p v-if="card.last_message" class="mt-2 line-clamp-2 text-xs text-brand-gray">
          {{ card.last_message }}
        </p>

        <div
          v-if="card.tags?.length || relativeUpdated || wonStage"
          class="mt-2.5 flex items-end justify-between gap-2"
        >
          <div v-if="card.tags?.length" class="flex min-w-0 flex-1 flex-wrap gap-1">
            <UiBadge
              v-for="tag in card.tags"
              :key="tag"
              :variant="funnelTagBadgeVariant(tag)"
              size="md"
            >
              {{ tag }}
            </UiBadge>
          </div>
          <span v-if="wonStage" class="shrink-0 text-[11px] font-bold text-emerald-600">Ganho</span>
          <span v-else-if="relativeUpdated" class="shrink-0 text-[11px] text-brand-gray">
            {{ relativeUpdated }}
          </span>
        </div>

        <div class="mt-2 flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
          <RouterLink
            v-if="card.conversation_id"
            :to="{ name: 'conversas', query: { conversation: card.conversation_id } }"
            class="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-indigo hover:underline"
          >
            <MessageSquare class="h-3 w-3" aria-hidden="true" />
            Abrir conversa
          </RouterLink>
          <span v-else class="flex-1" />
          <UiButton
            variant="ghost"
            size="sm"
            class="!px-1.5 !py-1 text-brand-gray hover:text-red-600"
            aria-label="Excluir card"
            @click="emit('delete', card)"
          >
            <Trash2 class="h-3.5 w-3.5" aria-hidden="true" />
          </UiButton>
        </div>
      </div>
    </div>
  </article>
</template>
