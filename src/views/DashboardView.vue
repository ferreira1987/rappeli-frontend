<script setup lang="ts">
import { Bell, MessageSquareReply } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import { fetchInboxConversations } from '@/api/inbox'
import { fetchWhatsAppAccount } from '@/api/whatsapp'
import ConversationListItem from '@/components/conversations/ConversationListItem.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import { useAuthStore } from '@/stores/auth'
import type { Conversation } from '@/types/conversations'
import { formatBrazilPhone } from '@/utils/phone'

const auth = useAuthStore()
const router = useRouter()

const recentConversations = ref<Conversation[]>([])
const conversationsLoading = ref(true)
const whatsappConnected = ref(false)
const whatsappDisplayPhone = ref<string | null>(null)
const whatsappLoading = ref(true)

const whatsappBadgeLabel = computed(() => {
  if (!whatsappConnected.value) {
    return ''
  }
  const formatted = formatBrazilPhone(whatsappDisplayPhone.value)
  const display = formatted || whatsappDisplayPhone.value
  return display ? `WhatsApp conectado (${display})` : 'WhatsApp conectado'
})

async function loadDashboard(): Promise<void> {
  conversationsLoading.value = true
  try {
    recentConversations.value = await fetchInboxConversations({ per_page: 5 })
  } catch {
    recentConversations.value = []
  } finally {
    conversationsLoading.value = false
  }

  whatsappLoading.value = true
  try {
    const account = await fetchWhatsAppAccount()
    whatsappConnected.value = account?.connected === true
    whatsappDisplayPhone.value = account?.display_phone_number ?? null
  } catch {
    whatsappConnected.value = false
    whatsappDisplayPhone.value = null
  } finally {
    whatsappLoading.value = false
  }
}

function openConversation(id: number): void {
  void router.push({ name: 'conversas', query: { conversa: String(id) } })
}

onMounted(() => {
  void loadDashboard()
})
</script>

<template>
  <div class="min-h-full bg-brand-mist px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
    <header class="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:gap-4">
      <h1 class="font-display text-xl font-semibold text-brand-ink sm:text-2xl lg:shrink-0">
        Painel
      </h1>

      <div
        class="order-2 flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:order-none lg:ml-auto lg:w-auto"
      >
        <RouterLink
          v-if="!whatsappLoading && !whatsappConnected"
          :to="{ name: 'configuracoes-whatsapp' }"
          class="inline-flex min-w-0 items-center justify-center rounded-full border border-brand-indigo/30 bg-white px-4 py-1.5 text-center text-xs font-semibold text-brand-indigo transition hover:bg-brand-mist sm:justify-start"
        >
          Conectar WhatsApp
        </RouterLink>
        <span
          v-else-if="whatsappConnected"
          class="inline-flex min-w-0 items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-center text-xs font-medium text-emerald-800 sm:justify-start"
        >
          {{ whatsappBadgeLabel }}
        </span>
        <button
          type="button"
          class="relative shrink-0 rounded-lg bg-white p-2 text-brand-gray shadow-sm"
          disabled
          aria-label="Notificações"
        >
          <Bell class="h-5 w-5" />
        </button>
        <span class="hidden text-sm text-brand-ink sm:inline">{{ auth.user?.name ?? 'Conta' }}</span>
      </div>
    </header>

    <div class="mt-6 space-y-6">
      <section class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div class="flex items-start gap-3">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-mist text-brand-indigo"
          >
            <MessageSquareReply class="h-5 w-5" aria-hidden="true" />
          </div>
          <div class="min-w-0">
            <h2 class="font-display text-lg font-semibold text-brand-ink">Respostas automáticas</h2>
            <p class="mt-1 text-sm text-brand-gray">
              Configure boas-vindas, mensagens fora do horário e respostas por palavra-chave para o
              WhatsApp da empresa.
            </p>
            <RouterLink
              :to="{ name: 'respostas-automaticas' }"
              class="mt-4 inline-flex rounded-xl bg-brand-indigo px-4 py-2 text-sm font-semibold text-white hover:bg-brand-indigo-hover"
            >
              Configurar respostas
            </RouterLink>
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4">
          <h2 class="font-display text-lg font-semibold text-brand-ink">Últimas conversas</h2>
          <RouterLink :to="{ name: 'conversas' }" class="text-sm font-medium text-brand-indigo">
            Ir para Conversas
          </RouterLink>
        </div>

        <div v-if="conversationsLoading" class="px-5 py-12 text-center text-sm text-brand-gray">
          Carregando conversas…
        </div>
        <ul v-else-if="recentConversations.length > 0" class="divide-y divide-slate-100">
          <li v-for="item in recentConversations" :key="item.id">
            <ConversationListItem :conversation="item" @select="openConversation(item.id)" />
          </li>
        </ul>
        <div v-else class="px-5 py-12 text-center text-sm text-brand-gray">
          <p class="font-medium text-brand-ink">Nenhuma conversa ainda</p>
          <p class="mt-1 text-xs">As mensagens recebidas pelo WhatsApp aparecerão aqui.</p>
          <RouterLink
            :to="{ name: 'conversas' }"
            class="mt-4 inline-flex rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-brand-ink hover:bg-slate-50"
          >
            Ir para Conversas
          </RouterLink>
        </div>
      </section>

      <AppPageFooter />
    </div>
  </div>
</template>
