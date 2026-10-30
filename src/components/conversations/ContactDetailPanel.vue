<script setup lang="ts">
import { Check, Copy, Tag, User, X } from '@lucide/vue'
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
  open: boolean
  conversation: Conversation | null
  activities?: ConversationActivity[]
  activitiesLoading?: boolean
  activitiesError?: string | null
}>()

const emit = defineEmits<{
  close: []
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
  <template v-if="conversation && open">
    <div
      class="fixed inset-0 z-40 bg-brand-ink/40 backdrop-blur-[1px] xl:hidden"
      aria-hidden="true"
      @click="emit('close')"
    />
    <aside
      id="contact-detail-panel"
      class="fixed inset-y-0 right-0 z-50 flex max-h-screen min-h-0 w-[min(280px,88vw)] shrink-0 flex-col border-l border-slate-200 bg-white shadow-lg xl:static xl:z-auto xl:max-h-none xl:w-[280px] xl:shadow-none"
      role="complementary"
      aria-label="Detalhes do contato"
    >
      <div class="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
        <h2
          id="contact-detail-panel-title"
          class="text-xs font-semibold uppercase tracking-wide text-brand-gray"
        >
          Contato
        </h2>
        <button
          type="button"
          class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-brand-gray transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo/20"
          aria-label="Fechar detalhes do contato"
          @click="emit('close')"
        >
          <X class="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div class="flex-1 overflow-y-auto p-4">
        <div class="flex flex-col items-center text-center">
          <div
            class="flex h-16 w-16 items-center justify-center rounded-full border border-indigo-100 bg-brand-mist text-lg font-bold text-brand-indigo"
          >
            <User
              v-if="avatarInitials(conversation.contact) == null"
              class="h-8 w-8"
              aria-hidden="true"
            />
            <span v-else>{{ avatarInitials(conversation.contact) }}</span>
          </div>
          <p class="mt-3 text-base font-semibold text-brand-ink">
            {{ inboxContactPrimaryLabel(conversation.contact) }}
          </p>
          <p
            v-if="
              contactHasDisplayName(conversation.contact) &&
              inboxContactSecondaryPhone(conversation.contact)
            "
            class="mt-0.5 text-sm text-brand-gray"
          >
            {{ inboxContactSecondaryPhone(conversation.contact) }}
          </p>
        </div>

        <dl class="mt-6 space-y-4 text-sm">
          <div>
            <dt class="text-xs font-semibold uppercase tracking-wide text-brand-gray">WhatsApp</dt>
            <dd class="mt-1.5 flex items-center gap-2">
              <span class="min-w-0 flex-1 break-all text-brand-ink">{{
                formattedPhone(conversation.contact)
              }}</span>
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

          <div v-if="(conversation.contact?.tags?.length ?? 0) > 0">
            <dt
              class="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-brand-gray"
            >
              <Tag class="h-3.5 w-3.5" aria-hidden="true" />
              Tags
            </dt>
            <dd class="mt-2 flex flex-wrap gap-1.5">
              <span
                v-for="tag in conversation.contact?.tags ?? []"
                :key="tag"
                class="rounded-full border border-indigo-100 bg-brand-mist px-2 py-0.5 text-[11px] font-medium text-brand-indigo"
              >
                {{ tag }}
              </span>
            </dd>
          </div>

          <div>
            <dt class="text-xs font-semibold uppercase tracking-wide text-brand-gray">
              Última interação
            </dt>
            <dd class="mt-1 text-brand-ink">{{ formatDateTime(conversation.last_message_at) }}</dd>
          </div>

          <div>
            <dt class="text-xs font-semibold uppercase tracking-wide text-brand-gray">Histórico</dt>
            <dd class="mt-2">
              <p v-if="activitiesLoading" class="text-xs text-brand-gray">Carregando…</p>
              <p v-else-if="activitiesError" class="text-xs text-red-600">{{ activitiesError }}</p>
              <ul v-else-if="activities?.length" class="space-y-2 text-xs text-brand-gray">
                <li
                  v-for="item in activities"
                  :key="item.id"
                  class="rounded-lg border border-slate-200 px-2 py-1.5"
                >
                  <span class="font-semibold text-brand-ink">{{
                    formatConversationActivityLabel(item.type, item.label)
                  }}</span>
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
</template>
