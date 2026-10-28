<script setup lang="ts">
import { Check, Copy, Tag, User } from '@lucide/vue'
import { ref } from 'vue'

import { initialsFromName } from '@/composables/useInitials'
import type { ConversationActivity } from '@/api/inbox'
import type { Conversation } from '@/types/conversations'
import { formatDateTime } from '@/utils/datetime'
import { formatConversationActivityLabel } from '@/utils/conversationActivityLabels'
import {
  contactHasDisplayName,
  inboxContactPrimaryLabel,
  inboxContactSecondaryPhone,
} from '@/utils/inbox'
import { formatBrazilPhone } from '@/utils/phone'

const props = defineProps<{
  conversation: Conversation | null
  activities?: ConversationActivity[]
  activitiesLoading?: boolean
  activitiesError?: string | null
}>()

const copied = ref(false)

function avatarInitials(contact: Conversation['contact']): string | null {
  if (!contactHasDisplayName(contact)) {
    return null
  }
  return initialsFromName(contact.display_name)
}

function formattedPhone(contact: Conversation['contact']): string {
  return formatBrazilPhone(contact.phone) || contact.phone
}

async function copyPhone(): Promise<void> {
  const phone = props.conversation?.contact.phone
  if (!phone) {
    return
  }
  try {
    await navigator.clipboard.writeText(phone)
    copied.value = true
    window.setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    copied.value = false
  }
}
</script>

<template>
  <aside
    v-if="conversation"
    class="hidden min-h-0 w-full shrink-0 flex-col border-l border-slate-100 bg-white xl:flex xl:w-[280px]"
  >
    <div class="border-b border-slate-100 px-4 py-4">
      <h2 class="text-xs font-semibold uppercase tracking-wide text-brand-gray">Contato</h2>
    </div>
    <div class="flex-1 overflow-y-auto p-4">
      <div class="flex flex-col items-center text-center">
        <div
          class="flex h-16 w-16 items-center justify-center rounded-full bg-brand-mist text-lg font-bold text-brand-indigo"
        >
          <User v-if="avatarInitials(conversation.contact) == null" class="h-8 w-8" aria-hidden="true" />
          <span v-else>{{ avatarInitials(conversation.contact) }}</span>
        </div>
        <p class="mt-3 font-display text-base font-semibold text-brand-ink">
          {{ inboxContactPrimaryLabel(conversation.contact) }}
        </p>
        <p
          v-if="contactHasDisplayName(conversation.contact) && inboxContactSecondaryPhone(conversation.contact)"
          class="mt-0.5 text-sm text-brand-gray"
        >
          {{ inboxContactSecondaryPhone(conversation.contact) }}
        </p>
      </div>

      <dl class="mt-6 space-y-4 text-sm">
        <div>
          <dt class="text-xs font-semibold uppercase tracking-wide text-brand-gray">WhatsApp</dt>
          <dd class="mt-1.5 flex items-center gap-2">
            <span class="min-w-0 flex-1 break-all text-brand-ink">{{ formattedPhone(conversation.contact) }}</span>
            <button
              type="button"
              class="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-brand-gray hover:bg-slate-50"
              @click="copyPhone"
            >
              <Check v-if="copied" class="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
              <Copy v-else class="h-3.5 w-3.5" aria-hidden="true" />
              {{ copied ? 'Copiado' : 'Copiar' }}
            </button>
          </dd>
        </div>

        <div v-if="conversation.contact.tags && conversation.contact.tags.length > 0">
          <dt class="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-brand-gray">
            <Tag class="h-3.5 w-3.5" aria-hidden="true" />
            Tags
          </dt>
          <dd class="mt-2 flex flex-wrap gap-1.5">
            <span
              v-for="tag in conversation.contact.tags"
              :key="tag"
              class="rounded-full bg-brand-mist px-2 py-0.5 text-[11px] font-medium text-brand-indigo"
            >
              {{ tag }}
            </span>
          </dd>
        </div>

        <div>
          <dt class="text-xs font-semibold uppercase tracking-wide text-brand-gray">Última interação</dt>
          <dd class="mt-1 text-brand-ink">{{ formatDateTime(conversation.last_message_at) }}</dd>
        </div>

        <div>
          <dt class="text-xs font-semibold uppercase tracking-wide text-brand-gray">Histórico</dt>
          <dd class="mt-2">
            <p v-if="activitiesLoading" class="text-xs text-brand-gray">Carregando…</p>
            <p v-else-if="activitiesError" class="text-xs text-red-600">{{ activitiesError }}</p>
            <ul v-else-if="activities?.length" class="space-y-2 text-xs text-brand-gray">
              <li v-for="item in activities" :key="item.id" class="rounded-lg border border-slate-100 px-2 py-1.5">
                <span class="font-semibold text-brand-ink">{{ formatConversationActivityLabel(item.type) }}</span>
                <span class="block text-[11px]">{{ formatDateTime(item.created_at) }}</span>
              </li>
            </ul>
            <p v-else class="text-xs text-brand-gray">Nenhuma atividade registrada.</p>
          </dd>
        </div>
      </dl>
    </div>
  </aside>
</template>
