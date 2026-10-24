<script setup lang="ts">
import { BarChart3, Bell, MessageSquare, Send, Timer, Users } from '@lucide/vue'
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import { fetchInboxConversations } from '@/api/inbox'
import { fetchWhatsAppAccount } from '@/api/whatsapp'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import { useAuthStore } from '@/stores/auth'
import type { Conversation } from '@/types/conversations'
import { formatConversationTime } from '@/utils/datetime'
import { inboxContactPrimaryLabel, inboxContactSecondaryPhone } from '@/utils/inbox'

const auth = useAuthStore()

const kpis = [
  { label: 'Conversas hoje', icon: MessageSquare, value: 0 },
  { label: 'Mensagens automáticas', icon: Send, value: 0 },
  { label: 'Tempo médio de resposta', icon: Timer, value: 0 },
  { label: 'Contatos novos', icon: Users, value: 0 },
]

const recentConversations = ref<Conversation[]>([])
const conversationsLoading = ref(true)
const whatsappConnected = ref(false)
const whatsappLoading = ref(true)

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
  } catch {
    whatsappConnected.value = false
  } finally {
    whatsappLoading.value = false
  }
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
          WhatsApp conectado
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
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="kpi in kpis"
          :key="kpi.label"
          class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
        >
          <div class="flex items-start justify-between gap-2">
            <p class="text-sm font-medium text-brand-gray">{{ kpi.label }}</p>
            <component :is="kpi.icon" class="h-5 w-5 text-brand-indigo/40" />
          </div>
          <p class="mt-3 font-display text-3xl font-semibold text-brand-ink">
            {{ kpi.value }}
          </p>
          <p class="mt-2 text-xs text-brand-gray">Sem dados ainda</p>
        </article>
      </div>

      <div class="grid gap-4 xl:grid-cols-3">
        <section class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm xl:col-span-2">
          <div class="flex items-center justify-between gap-2">
            <h2 class="font-display text-lg font-semibold text-brand-ink">Volume de mensagens</h2>
            <span class="rounded-full bg-brand-mist px-2.5 py-1 text-xs font-medium text-brand-indigo">7 dias</span>
          </div>
          <p class="mt-1 text-sm text-brand-gray">Acompanhe o envio e o recebimento ao longo da semana.</p>
          <div
            class="mt-6 flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center"
          >
            <BarChart3 class="h-8 w-8 text-slate-300" aria-hidden="true" />
            <p class="text-sm font-medium text-brand-ink">Sem dados para exibir</p>
            <p class="max-w-xs text-xs text-brand-gray">
              O gráfico será preenchido quando houver mensagens registradas.
            </p>
          </div>
        </section>

        <section class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <h2 class="font-display text-lg font-semibold text-brand-ink">Respostas automáticas</h2>
          <p class="mt-2 text-sm text-brand-gray">
            Boas-vindas, fora do horário e palavras-chave já podem ser configuradas.
          </p>
          <RouterLink
            :to="{ name: 'respostas-automaticas' }"
            class="mt-4 inline-flex rounded-xl bg-brand-indigo px-4 py-2 text-sm font-semibold text-white hover:bg-brand-indigo-hover"
          >
            Configurar respostas
          </RouterLink>
        </section>
      </div>

      <section class="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4">
          <h2 class="font-display text-lg font-semibold text-brand-ink">Últimas conversas</h2>
          <RouterLink :to="{ name: 'conversas' }" class="text-sm font-medium text-brand-indigo">
            Ver todas
          </RouterLink>
        </div>

        <div v-if="conversationsLoading" class="px-5 py-12 text-center text-sm text-brand-gray">
          Carregando conversas…
        </div>
        <ul v-else-if="recentConversations.length > 0" class="divide-y divide-slate-100">
          <li v-for="item in recentConversations" :key="item.id">
            <RouterLink
              :to="{ name: 'conversas', query: { conversa: String(item.id) } }"
              class="flex items-center justify-between gap-3 px-5 py-4 transition hover:bg-slate-50"
            >
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-brand-ink">
                  {{ inboxContactPrimaryLabel(item.contact) }}
                </p>
                <p
                  v-if="inboxContactSecondaryPhone(item.contact)"
                  class="truncate text-xs text-brand-gray"
                >
                  {{ inboxContactSecondaryPhone(item.contact) }}
                </p>
                <p v-else-if="item.last_message?.body" class="mt-0.5 truncate text-xs text-brand-gray">
                  {{ item.last_message.body }}
                </p>
              </div>
              <span class="shrink-0 text-xs text-brand-gray">
                {{ formatConversationTime(item.last_message_at) }}
              </span>
            </RouterLink>
          </li>
        </ul>
        <div v-else class="px-5 py-12 text-center text-sm text-brand-gray">
          <p class="font-medium text-brand-ink">Nenhuma conversa ainda</p>
          <p class="mt-1 text-xs">As mensagens recebidas pelo WhatsApp aparecerão aqui.</p>
          <RouterLink
            :to="{ name: 'conversas' }"
            class="mt-4 inline-flex rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-brand-ink hover:bg-slate-50"
          >
            Abrir conversas
          </RouterLink>
        </div>
      </section>

      <AppPageFooter />
    </div>
  </div>
</template>
