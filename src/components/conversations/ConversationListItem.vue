<script setup lang="ts">
import { Bot, User } from '@lucide/vue'

import MessageStatusIcon from '@/components/conversations/MessageStatusIcon.vue'
import { initialsFromName } from '@/composables/useInitials'
import type { Conversation } from '@/types/conversations'
import { formatRelativeConversationTime } from '@/utils/datetime'
import {
  contactHasDisplayName,
  inboxContactPrimaryLabel,
  inboxContactSecondaryPhone,
} from '@/utils/inbox'

defineProps<{
  conversation: Conversation
  selected?: boolean
}>()

defineEmits<{
  select: []
}>()

function avatarInitials(contact: Conversation['contact']): string | null {
  if (!contactHasDisplayName(contact)) {
    return null
  }
  return initialsFromName(contact.display_name)
}
</script>

<template>
  <button
    type="button"
    class="relative w-full p-3.5 text-left transition"
    :class="
      selected
        ? 'border-l-4 border-brand-indigo bg-brand-mist/60'
        : 'border-l-4 border-transparent hover:bg-slate-50'
    "
    @click="$emit('select')"
  >
    <div class="flex items-start justify-between gap-2">
      <div class="flex min-w-0 items-start gap-2.5">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-mist text-sm font-bold text-brand-indigo"
        >
          <User v-if="avatarInitials(conversation.contact) == null" class="h-5 w-5" aria-hidden="true" />
          <span v-else>{{ avatarInitials(conversation.contact) }}</span>
        </div>
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-brand-ink">
            {{ inboxContactPrimaryLabel(conversation.contact) }}
          </p>
          <p
            v-if="inboxContactSecondaryPhone(conversation.contact)"
            class="truncate text-[11px] text-brand-gray"
          >
            {{ inboxContactSecondaryPhone(conversation.contact) }}
          </p>
        </div>
      </div>
      <div class="flex shrink-0 flex-col items-end gap-1">
        <span class="text-[11px] font-medium text-brand-gray">
          {{ formatRelativeConversationTime(conversation.last_message_at) }}
        </span>
        <span
          v-if="conversation.unread_count > 0"
          class="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-brand-indigo px-1.5 py-0.5 text-[10px] font-bold leading-none text-white"
        >
          {{ conversation.unread_count > 99 ? '99+' : conversation.unread_count }}
        </span>
      </div>
    </div>
    <div
      v-if="conversation.last_message?.body"
      class="mt-2 flex items-center gap-1.5 text-xs text-brand-gray"
    >
      <span class="inline-flex shrink-0 items-center gap-0.5">
        <Bot
          v-if="conversation.last_message.is_automated"
          class="h-3.5 w-3.5 text-brand-indigo"
          aria-hidden="true"
        />
        <MessageStatusIcon
          v-if="conversation.last_message.direction === 'outbound'"
          :status="conversation.last_message.status"
        />
      </span>
      <p class="line-clamp-2 min-w-0 flex-1">{{ conversation.last_message.body }}</p>
    </div>
  </button>
</template>
