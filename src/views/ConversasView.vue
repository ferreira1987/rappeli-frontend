<script setup lang="ts">
import {
  ArrowLeft,
  ArrowRightLeft,
  CheckCircle2,
  CircleHelp,
  Loader2,
  MessageSquare,
  MessagesSquare,
  MoreVertical,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  Send,
  SlidersHorizontal,
  User,
} from '@lucide/vue'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import ContactDetailPanel from '@/components/conversations/ContactDetailPanel.vue'
import TransferConversationModal from '@/components/conversations/TransferConversationModal.vue'
import ConversationFilterTabs from '@/components/conversations/ConversationFilterTabs.vue'
import ConversationListItem from '@/components/conversations/ConversationListItem.vue'
import MessageStatusIcon from '@/components/conversations/MessageStatusIcon.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import AppPageShell from '@/components/layout/AppPageShell.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiInput from '@/components/ui/UiInput.vue'
import { useConversationsInbox } from '@/composables/useConversationsInbox'
import { initialsFromName } from '@/composables/useInitials'
import { isRealtimeConfigured } from '@/realtime/config'
import { useAuthStore } from '@/stores/auth'
import { useWhatsAppStore } from '@/stores/whatsapp'
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
import { getErrorMessage } from '@/utils/errors'
import { pluralizePt } from '@/utils/pluralize'

const auth = useAuthStore()
const whatsappStore = useWhatsAppStore()
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
const threadActionsOpen = ref(false)
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
const contactDetailOpen = ref(false)
const threadScrollEl = ref<HTMLElement | null>(null)
const filterChipsEl = ref<HTMLElement | null>(null)
const filterCounts = computed(() => filterCountsFromApi(listCounts.value))

const activeConversationCount = computed(() => {
  const fromApi = listCounts.value?.all
  if (typeof fromApi === 'number' && fromApi >= 0) {
    return fromApi
  }
  return conversations.value.length
})

const syncStatusLabel = computed(() => (isRealtimeConfigured() ? 'Sincronizado' : 'Modo manual'))

const showWhatsappDisconnectedBadge = computed(
  () => whatsappStore.hydrated && !whatsappStore.connected,
)

const supportMailto = 'mailto:contato@rappeli.com.br'

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
  return initialsFromName(contact?.display_name)
}

function focusFilterChips(): void {
  filterChipsEl.value?.querySelector('button')?.focus()
}

onMounted(() => {
  if (!whatsappStore.hydrated) {
    void whatsappStore.refresh()
  }
})

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

function onMobileTransfer(): void {
  threadActionsOpen.value = false
  openTransferModal()
}

function onMobileResolve(): void {
  threadActionsOpen.value = false
  void onResolve()
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
  contactDetailOpen.value = false
  if (id != null) {
    void loadActivities(id)
  } else {
    activities.value = []
  }
})

function toggleContactDetail(): void {
  contactDetailOpen.value = !contactDetailOpen.value
}

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
  <AppPageShell title="Conversas" flush>
    <template v-if="transferNotice" #toolbar>
      <p
        class="shrink-0 border-b border-indigo-100 bg-brand-mist px-4 py-2 text-xs text-brand-indigo"
        role="status"
      >
        {{ transferNotice }}
      </p>
    </template>

    <div
      class="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[minmax(280px,320px)_1fr]"
      :class="
        contactDetailOpen ? 'xl:grid-cols-[minmax(280px,320px)_1fr_280px]' : ''
      "
    >
      <!-- Lista de conversas -->
      <section
        class="flex min-h-0 flex-col border-r border-slate-200 bg-white"
        :class="mobileShowThread ? 'hidden lg:flex' : 'flex'"
      >
        <div class="border-b border-slate-200 p-4">
          <div class="mb-3 flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <h1 class="text-lg font-bold leading-none text-brand-ink">Conversas</h1>
              <UiBadge variant="neutral" size="md">{{ activeConversationCount }}</UiBadge>
            </div>
            <div class="flex items-center gap-1 text-brand-gray">
              <button
                type="button"
                class="rounded p-1 transition-colors hover:bg-slate-50 hover:text-brand-ink disabled:opacity-60"
                title="Atualizar"
                :disabled="listLoading"
                @click="loadConversations()"
              >
                <RefreshCw
                  class="h-[18px] w-[18px]"
                  :class="listLoading ? 'animate-spin' : ''"
                  aria-hidden="true"
                />
                <span class="sr-only">Atualizar conversas</span>
              </button>
              <button
                type="button"
                class="rounded p-1 transition-colors hover:bg-slate-50 hover:text-brand-ink"
                title="Filtros"
                @click="focusFilterChips()"
              >
                <SlidersHorizontal class="h-[18px] w-[18px]" aria-hidden="true" />
                <span class="sr-only">Ir para filtros</span>
              </button>
            </div>
          </div>

          <UiInput
            v-model="searchQuery"
            type="search"
            autocomplete="off"
            placeholder="Buscar por nome ou telefone…"
            input-class="h-9 bg-brand-surface text-xs"
          >
            <template #leading>
              <Search class="h-4 w-4" aria-hidden="true" />
            </template>
          </UiInput>

          <div ref="filterChipsEl" class="mt-3">
            <ConversationFilterTabs
              :active="listFilter"
              :counts="filterCounts"
              @change="setListFilter"
            />
          </div>
        </div>

        <div v-if="listLoading" class="flex flex-1 items-center justify-center p-6">
          <Loader2 class="h-6 w-6 animate-spin text-brand-indigo" aria-label="Carregando conversas" />
        </div>

        <div
          v-else-if="listError"
          class="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center"
        >
          <p class="text-sm text-red-600">{{ listError }}</p>
          <UiButton type="button" @click="loadConversations()">Tentar novamente</UiButton>
        </div>

        <ul v-else-if="conversations.length > 0" class="min-h-0 flex-1 overflow-y-auto">
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
          class="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center"
        >
          <div
            class="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-brand-surface text-brand-gray"
          >
            <MessageSquare class="h-6 w-6" aria-hidden="true" />
          </div>
          <template v-if="isSearchActive">
            <p class="text-sm font-semibold text-brand-ink">
              Nenhuma conversa encontrada para “{{ searchActiveLabel }}”
            </p>
          </template>
          <template v-else>
            <p class="text-sm font-semibold text-brand-ink">Nenhuma conversa ainda</p>
            <p class="max-w-[220px] text-xs leading-relaxed text-brand-gray">
              Suas mensagens recebidas pelo WhatsApp aparecerão aqui em tempo real.
            </p>
            <RouterLink
              v-if="showWhatsappDisconnectedBadge"
              :to="{ name: 'configuracoes-whatsapp' }"
              class="inline-flex"
            >
              <UiButton size="sm" class="gap-2">
                <QrCode class="h-4 w-4" aria-hidden="true" />
                Conectar WhatsApp
              </UiButton>
            </RouterLink>
          </template>
        </div>

        <div
          class="flex shrink-0 items-center justify-between border-t border-slate-200 bg-brand-surface px-4 py-2.5 text-[11px] text-brand-gray"
        >
          <span>{{
            pluralizePt(activeConversationCount, 'conversa', {
              one: 'conversa ativa',
              other: 'conversas ativas',
            })
          }}</span>
          <span class="inline-flex items-center gap-1.5">
            <span class="h-1.5 w-1.5 rounded-full bg-slate-300" aria-hidden="true" />
            {{ syncStatusLabel }}
          </span>
        </div>
      </section>

      <!-- Chat + workspace -->
      <section
        class="flex min-h-0 flex-col bg-brand-surface"
        :class="!mobileShowThread ? 'hidden lg:flex' : 'flex'"
      >
        <header
          class="flex h-16 shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6"
        >
          <nav class="flex items-center gap-2 text-xs text-brand-gray" aria-label="Contexto">
            <span>Conversas</span>
            <span aria-hidden="true">/</span>
            <span class="font-medium text-brand-ink">Caixa de entrada</span>
          </nav>

          <div class="flex flex-wrap items-center gap-2 sm:gap-3">
            <span
              v-if="showWhatsappDisconnectedBadge"
              class="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden="true" />
              WhatsApp desconectado
            </span>
            <a
              :href="supportMailto"
              class="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-brand-gray transition-colors hover:bg-slate-100 hover:text-brand-ink"
            >
              <CircleHelp class="h-4 w-4" aria-hidden="true" />
              <span class="hidden sm:inline">Ajuda</span>
            </a>
            <RouterLink :to="{ name: 'contatos' }" class="inline-flex">
              <UiButton size="sm" class="gap-1.5">
                <Plus class="h-4 w-4" aria-hidden="true" />
                Nova Conversa
              </UiButton>
            </RouterLink>
          </div>
        </header>

        <div v-if="!selectedConversation" class="flex min-h-0 flex-1 flex-col">
          <div class="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <MessagesSquare class="h-8 w-8 text-slate-300" aria-hidden="true" />
            <p class="mt-2 text-sm text-brand-gray">Aguardando a primeira mensagem</p>
          </div>
          <div class="shrink-0 border-t border-slate-200 bg-white px-4 py-2 sm:px-6">
            <AppPageFooter class="!mt-0 !border-t-0 !pt-0" />
          </div>
        </div>

        <template v-else>
          <div
            class="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6"
          >
            <button
              type="button"
              class="rounded-lg p-2 text-brand-gray hover:bg-slate-100 lg:hidden"
              aria-label="Voltar para a lista"
              @click="backToList"
            >
              <ArrowLeft class="h-5 w-5" />
            </button>
            <button
              type="button"
              class="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-lg text-left transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo/20"
              :aria-expanded="contactDetailOpen"
              aria-controls="contact-detail-panel"
              @click="toggleContactDetail"
            >
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-indigo-100 bg-brand-mist text-sm font-bold text-brand-indigo"
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
            </button>
            <div class="hidden items-center gap-2 sm:flex">
              <UiButton variant="secondary" size="sm" type="button" @click="openTransferModal">
                <ArrowRightLeft class="h-3.5 w-3.5 text-brand-indigo" />
                Transferir
              </UiButton>
              <UiButton
                variant="secondary"
                size="sm"
                type="button"
                :disabled="resolveLoading"
                @click="onResolve"
              >
                <CheckCircle2 class="h-3.5 w-3.5 text-emerald-600" />
                Resolver
              </UiButton>
            </div>
            <div class="relative sm:hidden">
              <button
                type="button"
                class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-brand-gray hover:bg-slate-50"
                aria-label="Ações da conversa"
                aria-haspopup="menu"
                :aria-expanded="threadActionsOpen"
                @click="threadActionsOpen = !threadActionsOpen"
              >
                <MoreVertical class="h-4 w-4" />
              </button>
              <div
                v-if="threadActionsOpen"
                class="absolute right-0 z-20 mt-1 min-w-[11rem] overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                role="menu"
              >
                <button
                  type="button"
                  role="menuitem"
                  class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-brand-ink hover:bg-slate-50"
                  @click="onMobileTransfer"
                >
                  <ArrowRightLeft class="h-4 w-4 text-brand-indigo" aria-hidden="true" />
                  Transferir
                </button>
                <button
                  type="button"
                  role="menuitem"
                  class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-brand-ink hover:bg-slate-50 disabled:opacity-50"
                  :disabled="resolveLoading"
                  @click="onMobileResolve"
                >
                  <CheckCircle2 class="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  Resolver
                </button>
              </div>
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
            class="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6"
            @scroll.passive="onThreadScroll"
          >
            <p v-if="loadingOlderMessages" class="mb-3 text-center text-xs text-brand-gray">
              Carregando mensagens anteriores…
            </p>
            <div class="space-y-3">
              <template v-for="item in threadItems" :key="item.key">
                <div v-if="item.kind === 'date'" class="flex justify-center py-1">
                  <span
                    class="rounded-full bg-slate-200 px-3 py-0.5 text-[11px] font-medium text-brand-gray"
                  >
                    {{ item.label }}
                  </span>
                </div>
                <div
                  v-else
                  class="flex"
                  :class="item.message.direction === 'outbound' ? 'justify-end' : 'justify-start'"
                >
                  <div
                    class="max-w-[min(100%,28rem)] rounded-2xl px-3.5 py-2.5 text-sm"
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
                            ? 'bg-indigo-800 text-indigo-100'
                            : 'bg-slate-100 text-brand-gray'
                        "
                      >
                        {{ automatedMessageLabel(item.message) }}
                      </span>
                    </div>
                    <div
                      class="mt-1 flex items-center justify-end gap-1.5"
                      :class="
                        item.message.direction === 'outbound' ? 'text-indigo-100' : 'text-brand-gray'
                      "
                    >
                      <span class="text-[10px]">{{
                        item.message.created_at ? formatMessageTime(item.message.created_at) : ''
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

          <div class="shrink-0 border-t border-slate-200 bg-white p-4">
            <p v-if="composerError" class="mb-2 text-xs text-red-600" role="alert">
              {{ composerError }}
            </p>
            <div class="flex gap-2">
              <textarea
                v-model="draft"
                rows="2"
                :disabled="!canSendMessage || sending"
                placeholder="Digite sua mensagem…"
                class="min-h-[44px] min-w-0 flex-1 resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20 disabled:bg-slate-50 disabled:text-brand-gray"
                @keydown="onComposerKeydown"
              />
              <UiButton
                type="button"
                class="!h-11 !w-11 !px-0"
                :disabled="!canSendMessage || sending || !draft.trim()"
                aria-label="Enviar mensagem"
                @click="onSend()"
              >
                <Loader2 v-if="sending" class="h-5 w-5 animate-spin" />
                <Send v-else class="h-5 w-5" />
              </UiButton>
            </div>
          </div>

          <div class="shrink-0 border-t border-slate-200 bg-white px-4 py-2 sm:px-6">
            <AppPageFooter class="!mt-0 !border-t-0 !pt-0" />
          </div>
        </template>
      </section>

      <ContactDetailPanel
        :open="contactDetailOpen"
        :conversation="selectedConversation"
        :activities="activities"
        :activities-loading="activitiesLoading"
        :activities-error="activitiesError"
        @close="contactDetailOpen = false"
      />
    </div>

    <TransferConversationModal
      :open="transferOpen"
      :contact-name="transferContactName"
      @close="transferOpen = false"
      @transferred="onTransferred"
    />
  </AppPageShell>
</template>
