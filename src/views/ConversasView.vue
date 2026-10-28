<script setup lang="ts">
import {
  ArrowLeft,
  ArrowRightLeft,
  CheckCircle2,
  Loader2,
  MessageSquare,
  MoreVertical,
  RefreshCw,
  Search,
  Send,
  User,
} from '@lucide/vue'
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppPageHeader from '@/components/app/AppPageHeader.vue'
import ContactDetailPanel from '@/components/conversations/ContactDetailPanel.vue'
import TransferConversationModal from '@/components/conversations/TransferConversationModal.vue'
import ConversationFilterTabs from '@/components/conversations/ConversationFilterTabs.vue'
import ConversationListItem from '@/components/conversations/ConversationListItem.vue'
import MessageStatusIcon from '@/components/conversations/MessageStatusIcon.vue'
import { useConversationsInbox } from '@/composables/useConversationsInbox'
import { initialsFromName } from '@/composables/useInitials'
import { useAuthStore } from '@/stores/auth'
import type { ConversationMessage, InboxContact } from '@/types/conversations'
import { automatedMessageLabel } from '@/utils/automatedReply'
import { filterCountsFromApi } from '@/utils/conversationFilters'
import {
  formatMessageDateSeparator,
  formatMessageTime,
  messageDayKey,
} from '@/utils/datetime'
import {
  contactHasDisplayName,
  inboxContactPrimaryLabel,
  inboxContactSecondaryPhone,
  isMessagingWindowOpen,
} from '@/utils/inbox'
import { MESSAGING_WINDOW_CLOSED_MESSAGE } from '@/utils/messaging'
import {
  fetchConversationActivities,
  resolveInboxConversation,
  transferInboxConversation,
  type ConversationActivity,
  type TransferConversationPayload,
} from '@/api/inbox'
import { panelBreadcrumbs } from '@/constants/panelBreadcrumbs'
import { getErrorMessage } from '@/utils/errors'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const companyId = computed(() => auth.user?.company_id ?? null)

const {
  conversations,
  messages,
  selectedId,
  selectedConversation,
  searchQuery,
  listLoading,
  messagesLoading,
  sending,
  listError,
  threadError,
  composerError,
  windowClosed,
  totalUnread,
  listFilter,
  listCounts,
  setListFilter,
  canSendMessage,
  loadConversations,
  selectConversation,
  sendMessage,
  loadOlderMessages,
  loadingOlderMessages,
  hasOlderMessages,
  consumeScrollToBottomRequest,
  requestScrollToBottom,
} = useConversationsInbox(() => companyId.value)

const SCROLL_NEAR_BOTTOM_PX = 80

const draft = ref('')
const transferOpen = ref(false)
const transferNotice = ref<string | null>(null)
const resolveLoading = ref(false)
const activities = ref<ConversationActivity[]>([])
const activitiesLoading = ref(false)
const activitiesError = ref<string | null>(null)

const transferContactName = computed(() => {
  const conversation = selectedConversation.value
  if (!conversation) {
    return 'Contato'
  }
  return inboxContactPrimaryLabel(conversation.contact)
})
const mobileShowThread = ref(false)
const threadScrollEl = ref<HTMLElement | null>(null)
const filterCounts = computed(() => filterCountsFromApi(listCounts.value))

const isSearchActive = computed(() => searchQuery.value.trim().length > 0)
const searchActiveLabel = computed(() => searchQuery.value.trim())

type ThreadItem =
  | { kind: 'date'; key: string; label: string }
  | { kind: 'message'; key: string; message: ConversationMessage }

const threadItems = computed((): ThreadItem[] => {
  const items: ThreadItem[] = []
  let lastDay = ''

  for (const message of messages.value) {
    const timestamp = message.created_at ?? message.wa_timestamp
    const day = messageDayKey(timestamp)
    if (day && day !== lastDay) {
      const label = formatMessageDateSeparator(timestamp)
      if (label) {
        items.push({ kind: 'date', key: `date-${day}`, label })
      }
      lastDay = day
    }
    items.push({ kind: 'message', key: `msg-${message.id}`, message })
  }

  return items
})

function isThreadNearBottom(): boolean {
  const el = threadScrollEl.value
  if (!el) {
    return true
  }
  return el.scrollHeight - el.scrollTop - el.clientHeight <= SCROLL_NEAR_BOTTOM_PX
}

async function scrollThreadToBottom(force = false): Promise<void> {
  await nextTick()
  const el = threadScrollEl.value
  if (!el) {
    return
  }
  const shouldStick = force || consumeScrollToBottomRequest() || isThreadNearBottom()
  if (shouldStick) {
    el.scrollTop = el.scrollHeight
  }
}

watch(
  () => messages.value.at(-1)?.id,
  () => {
    void scrollThreadToBottom()
  },
)

watch(messagesLoading, (loading, wasLoading) => {
  if (wasLoading && !loading) {
    void scrollThreadToBottom(true)
  }
})

function onThreadScroll(event: Event): void {
  const el = event.target as HTMLElement
  if (el.scrollTop < 48 && hasOlderMessages.value && !loadingOlderMessages.value) {
    void loadOlderMessages(el)
  }
}

function contactAvatarInitials(contact: InboxContact): string | null {
  if (!contactHasDisplayName(contact)) {
    return null
  }
  return initialsFromName(contact.display_name)
}

const showWindowClosedBanner = computed(() => {
  if (windowClosed.value) {
    return true
  }
  const conversation = selectedConversation.value
  return conversation != null && !isMessagingWindowOpen(conversation)
})

watch(
  () => route.query.conversa,
  (raw) => {
    const id = typeof raw === 'string' ? Number.parseInt(raw, 10) : NaN
    if (!Number.isNaN(id) && id > 0) {
      selectConversation(id)
      mobileShowThread.value = true
    }
  },
  { immediate: true },
)

function openConversation(id: number): void {
  selectConversation(id)
  mobileShowThread.value = true
  void router.replace({ query: { ...route.query, conversa: String(id) } })
}

function backToList(): void {
  mobileShowThread.value = false
  selectConversation(null)
  const query = { ...route.query }
  delete query.conversa
  void router.replace({ query })
}

async function onSend(): Promise<void> {
  const text = draft.value
  if (!text.trim()) {
    return
  }
  requestScrollToBottom()
  const ok = await sendMessage(text)
  if (ok) {
    draft.value = ''
    await scrollThreadToBottom(true)
  }
}

function onComposerKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    void onSend()
  }
}

function openTransferModal(): void {
  transferOpen.value = true
}

async function loadActivities(conversationId: number): Promise<void> {
  activitiesLoading.value = true
  activitiesError.value = null
  try {
    activities.value = await fetchConversationActivities(conversationId)
  } catch (err) {
    activitiesError.value = getErrorMessage(err)
    activities.value = []
  } finally {
    activitiesLoading.value = false
  }
}

watch(selectedId, (id) => {
  if (id != null) {
    void loadActivities(id)
  } else {
    activities.value = []
  }
})

async function onTransferred(payload: TransferConversationPayload): Promise<void> {
  const id = selectedId.value
  if (id == null) return
  try {
    await transferInboxConversation(id, payload)
    transferNotice.value = 'Conversa transferida com sucesso.'
    await loadConversations()
    void loadActivities(id)
  } catch (err) {
    transferNotice.value = getErrorMessage(err)
  }
  window.setTimeout(() => {
    transferNotice.value = null
  }, 5000)
}

async function onResolve(): Promise<void> {
  const id = selectedId.value
  if (id == null) return
  resolveLoading.value = true
  try {
    await resolveInboxConversation(id)
    transferNotice.value = 'Conversa marcada como resolvida.'
    await loadConversations()
    void loadActivities(id)
  } catch (err) {
    transferNotice.value = getErrorMessage(err)
  } finally {
    resolveLoading.value = false
    window.setTimeout(() => {
      transferNotice.value = null
    }, 5000)
  }
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col bg-brand-mist">
    <AppPageHeader
      title="Conversas"
      :breadcrumbs="panelBreadcrumbs({ label: 'Conversas' })"
    >
      <template #actions>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-brand-ink hover:bg-slate-50 disabled:opacity-60"
          :disabled="listLoading"
          @click="loadConversations()"
        >
          <RefreshCw
            class="h-4 w-4 text-brand-gray"
            :class="listLoading ? 'animate-spin' : ''"
            aria-hidden="true"
          />
          Atualizar
        </button>
      </template>
    </AppPageHeader>

    <p
      v-if="transferNotice"
      class="shrink-0 border-b border-indigo-100 bg-indigo-50 px-4 py-2 text-xs text-brand-indigo"
      role="status"
    >
      {{ transferNotice }}
    </p>

    <div
      class="grid min-h-0 flex-1 grid-cols-1 bg-white lg:grid-cols-[minmax(280px,360px)_1fr] xl:grid-cols-[minmax(280px,360px)_1fr_auto]"
    >
      <!-- Lista -->
      <section
        class="flex min-h-0 flex-col border-r border-slate-100"
        :class="mobileShowThread ? 'hidden lg:flex' : 'flex'"
      >
        <div class="flex flex-col gap-3 border-b border-slate-100 p-4">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <h2 class="font-display text-base font-bold text-brand-ink">Mensagens</h2>
              <span
                v-if="totalUnread > 0"
                class="rounded-full bg-brand-mist px-2 py-0.5 text-xs font-semibold text-brand-indigo"
              >
                {{ totalUnread }} não lidas
              </span>
            </div>
          </div>

          <div class="relative">
            <Search
              class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray"
              aria-hidden="true"
            />
            <input
              v-model="searchQuery"
              type="search"
              autocomplete="off"
              placeholder="Buscar por nome ou telefone…"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm transition focus:border-brand-indigo focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
            />
          </div>
        </div>

        <ConversationFilterTabs
          :active="listFilter"
          :counts="filterCounts"
          @change="setListFilter"
        />

        <div v-if="listLoading" class="flex flex-1 items-center justify-center p-6">
          <Loader2 class="h-6 w-6 animate-spin text-brand-indigo" aria-label="Carregando conversas" />
        </div>

        <div
          v-else-if="listError"
          class="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center"
        >
          <p class="text-sm text-red-600">{{ listError }}</p>
          <button
            type="button"
            class="rounded-xl bg-brand-indigo px-4 py-2 text-sm font-semibold text-white hover:bg-brand-indigo-hover"
            @click="loadConversations()"
          >
            Tentar novamente
          </button>
        </div>

        <ul
          v-else-if="conversations.length > 0"
          class="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto"
        >
          <li v-for="item in conversations" :key="item.id">
            <ConversationListItem
              :conversation="item"
              :selected="selectedId === item.id"
              @select="openConversation(item.id)"
            />
          </li>
        </ul>

        <div
          v-else
          class="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-sm text-brand-gray"
        >
          <MessageSquare class="h-10 w-10 text-slate-300" aria-hidden="true" />
          <p v-if="isSearchActive" class="font-medium text-brand-ink">
            Nenhuma conversa encontrada para “{{ searchActiveLabel }}”
          </p>
          <template v-else>
            <p class="font-medium text-brand-ink">Nenhuma conversa ainda</p>
            <p class="max-w-xs text-xs">
              Quando clientes enviarem mensagens pelo WhatsApp, elas aparecerão aqui.
            </p>
          </template>
        </div>
      </section>

      <!-- Thread -->
      <section
        class="flex min-h-0 flex-col bg-slate-50/40"
        :class="!mobileShowThread ? 'hidden lg:flex' : 'flex'"
      >
        <div
          v-if="!selectedConversation"
          class="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-sm text-brand-gray"
        >
          <MessageSquare class="h-12 w-12 text-slate-300" aria-hidden="true" />
          <p class="font-medium text-brand-ink">Selecione uma conversa</p>
          <p class="max-w-sm text-xs">Escolha um contato na lista para ver o histórico e responder.</p>
        </div>

        <template v-else>
          <div
            class="flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3 shadow-xs"
          >
            <button
              type="button"
              class="rounded-lg p-2 text-brand-gray hover:bg-slate-100 lg:hidden"
              aria-label="Voltar para a lista"
              @click="backToList"
            >
              <ArrowLeft class="h-5 w-5" />
            </button>
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full bg-brand-mist text-sm font-bold text-brand-indigo"
            >
              <User
                v-if="contactAvatarInitials(selectedConversation.contact) == null"
                class="h-5 w-5"
                aria-hidden="true"
              />
              <span v-else>{{ contactAvatarInitials(selectedConversation.contact) }}</span>
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate font-semibold text-brand-ink">
                {{ inboxContactPrimaryLabel(selectedConversation.contact) }}
              </p>
              <p
                v-if="inboxContactSecondaryPhone(selectedConversation.contact)"
                class="truncate text-xs text-brand-gray"
              >
                {{ inboxContactSecondaryPhone(selectedConversation.contact) }}
              </p>
            </div>
            <div class="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-ink hover:bg-slate-50"
                @click="openTransferModal"
              >
                <ArrowRightLeft class="h-3.5 w-3.5 text-brand-indigo" />
                Transferir
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-ink hover:bg-slate-50 disabled:opacity-60"
                :disabled="resolveLoading"
                @click="onResolve"
              >
                <CheckCircle2 class="h-3.5 w-3.5 text-emerald-600" />
                Resolver
              </button>
              <button
                type="button"
                class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-brand-gray hover:bg-slate-50"
                aria-label="Mais opções"
              >
                <MoreVertical class="h-4 w-4" />
              </button>
            </div>
          </div>

          <div
            v-if="showWindowClosedBanner"
            class="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-900"
            role="alert"
          >
            {{ MESSAGING_WINDOW_CLOSED_MESSAGE }}
          </div>

          <div v-if="messagesLoading" class="flex flex-1 items-center justify-center">
            <Loader2 class="h-6 w-6 animate-spin text-brand-indigo" aria-label="Carregando mensagens" />
          </div>

          <div
            v-else-if="threadError"
            class="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center text-sm text-red-600"
          >
            <p>{{ threadError }}</p>
          </div>

          <div
            v-else-if="messages.length === 0"
            class="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center text-sm text-brand-gray"
          >
            <p class="font-medium text-brand-ink">Nenhuma mensagem nesta conversa</p>
            <p class="max-w-sm text-xs">O histórico será exibido aqui quando houver troca de mensagens.</p>
          </div>

          <div
            v-else
            ref="threadScrollEl"
            class="min-h-0 flex-1 overflow-y-auto p-4"
            @scroll.passive="onThreadScroll"
          >
            <p
              v-if="loadingOlderMessages"
              class="mb-3 text-center text-xs text-brand-gray"
            >
              Carregando mensagens anteriores…
            </p>
            <div class="space-y-3">
              <template v-for="item in threadItems" :key="item.key">
                <div v-if="item.kind === 'date'" class="flex justify-center py-1">
                  <span
                    class="rounded-full bg-slate-200/80 px-3 py-0.5 text-[11px] font-medium text-brand-gray"
                  >
                    {{ item.label }}
                  </span>
                </div>
                <div
                  v-else
                  class="flex"
                  :class="
                    item.message.direction === 'outbound' ? 'justify-end' : 'justify-start'
                  "
                >
                  <div
                    class="max-w-[min(100%,28rem)] rounded-2xl px-3.5 py-2.5 text-sm shadow-xs"
                    :class="
                      item.message.direction === 'outbound'
                        ? 'rounded-br-md bg-brand-indigo text-white'
                        : 'rounded-bl-md border border-slate-200 bg-white text-brand-ink'
                    "
                  >
                    <p class="whitespace-pre-wrap break-words">{{ item.message.body }}</p>
                    <div
                      v-if="automatedMessageLabel(item.message)"
                      class="mt-1.5 flex justify-end"
                    >
                      <span
                        class="rounded-full px-2 py-0.5 text-[10px] font-medium"
                        :class="
                          item.message.direction === 'outbound'
                            ? 'bg-white/15 text-indigo-100'
                            : 'bg-slate-100 text-brand-gray'
                        "
                      >
                        {{ automatedMessageLabel(item.message) }}
                      </span>
                    </div>
                    <div
                      class="mt-1 flex items-center justify-end gap-1.5"
                      :class="
                        item.message.direction === 'outbound'
                          ? 'text-indigo-100'
                          : 'text-brand-gray'
                      "
                    >
                      <span class="text-[10px]">{{
                        item.message.created_at
                          ? formatMessageTime(item.message.created_at)
                          : ''
                      }}</span>
                      <MessageStatusIcon
                        v-if="item.message.direction === 'outbound'"
                        :status="item.message.status"
                        :delivered-at="item.message.delivered_at"
                        :read-at="item.message.read_at"
                        :failed-at="item.message.failed_at"
                        :failure-reason="item.message.failure_reason"
                        on-brand-bubble
                      />
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <div class="border-t border-slate-100 bg-white p-4">
            <p
              v-if="composerError"
              class="mb-2 text-xs text-red-600"
              role="alert"
            >
              {{ composerError }}
            </p>
            <div class="flex gap-2">
              <textarea
                v-model="draft"
                rows="2"
                :disabled="!canSendMessage || sending"
                placeholder="Digite sua mensagem…"
                class="min-h-[44px] min-w-0 flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20 disabled:bg-slate-50 disabled:text-brand-gray"
                @keydown="onComposerKeydown"
              />
              <button
                type="button"
                class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-indigo text-white transition hover:bg-brand-indigo-hover disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="!canSendMessage || sending || !draft.trim()"
                aria-label="Enviar mensagem"
                @click="onSend()"
              >
                <Loader2 v-if="sending" class="h-5 w-5 animate-spin" />
                <Send v-else class="h-5 w-5" />
              </button>
            </div>
          </div>
        </template>
      </section>

      <ContactDetailPanel
        :conversation="selectedConversation"
        :activities="activities"
        :activities-loading="activitiesLoading"
        :activities-error="activitiesError"
      />
    </div>

    <TransferConversationModal
      :open="transferOpen"
      :contact-name="transferContactName"
      @close="transferOpen = false"
      @transferred="onTransferred"
    />
  </div>
</template>
