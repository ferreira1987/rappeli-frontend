<script setup lang="ts">
import { BarChart3, Bell, MessageSquare, MessageSquareReply, Send, Timer, Users } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import { fetchDashboardMetrics } from '@/api/dashboard'
import { fetchInboxConversations } from '@/api/inbox'
import { fetchWhatsAppAccount } from '@/api/whatsapp'
import MessageVolumeChart from '@/components/dashboard/MessageVolumeChart.vue'
import ConversationListItem from '@/components/conversations/ConversationListItem.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import { useAuthStore } from '@/stores/auth'
import type { DashboardMetrics } from '@/types/dashboard'
import type { Conversation } from '@/types/conversations'
import { formatAverageResponseTime, formatDashboardCount } from '@/utils/formatDashboard'
import { formatBrazilPhone } from '@/utils/phone'

const auth = useAuthStore()
const router = useRouter()

const metrics = ref<DashboardMetrics | null>(null)
const metricsLoading = ref(true)
const metricsUnavailable = ref(false)

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

const volumePeriodLabel = computed(() => {
  const days = metrics.value?.message_volume?.period_days
  if (days == null || days <= 0) {
    return '7 dias'
  }
  return days === 1 ? '1 dia' : `${days} dias`
})

const automatedMessagesHint = computed(() => {
  const days = metrics.value?.automated_messages_period_days
  if (days == null) {
    return 'Sem dados ainda'
  }
  return days === 1 ? 'Último dia' : `Últimos ${days} dias`
})

const kpiCards = computed(() => {
  const data = metrics.value
  return [
    {
      key: 'conversations_today',
      label: 'Conversas hoje',
      icon: MessageSquare,
      value: formatDashboardCount(data?.conversations_today),
      hint: data?.conversations_today == null ? 'Sem dados ainda' : 'Hoje',
    },
    {
      key: 'automated_messages',
      label: 'Mensagens automáticas',
      icon: Send,
      value: formatDashboardCount(data?.automated_messages_count),
      hint:
        data?.automated_messages_count == null ? 'Sem dados ainda' : automatedMessagesHint.value,
    },
    {
      key: 'response_time',
      label: 'Tempo médio de resposta',
      icon: Timer,
      value: formatAverageResponseTime(data?.average_response_time_seconds),
      hint: data?.average_response_time_seconds == null ? 'Sem dados ainda' : 'Média recente',
    },
    {
      key: 'new_contacts',
      label: 'Contatos novos',
      icon: Users,
      value: formatDashboardCount(data?.new_contacts_today),
      hint: data?.new_contacts_today == null ? 'Sem dados ainda' : 'Hoje',
    },
  ]
})

const hasVolumeChart = computed(
  () => (metrics.value?.message_volume?.points.length ?? 0) > 0,
)

async function loadDashboard(): Promise<void> {
  metricsLoading.value = true
  metricsUnavailable.value = false
  try {
    metrics.value = await fetchDashboardMetrics()
    if (metrics.value == null) {
      metricsUnavailable.value = true
    }
  } catch {
    metrics.value = null
    metricsUnavailable.value = true
  } finally {
    metricsLoading.value = false
  }

  conversationsLoading.value = true
  try {
    const page = await fetchInboxConversations({ per_page: 5 })
    recentConversations.value = page.conversations
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
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="kpi in kpiCards"
          :key="kpi.key"
          class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
        >
          <div class="flex items-start justify-between gap-2">
            <p class="text-sm font-medium text-brand-gray">{{ kpi.label }}</p>
            <component :is="kpi.icon" class="h-5 w-5 text-brand-indigo/40" aria-hidden="true" />
          </div>
          <p class="mt-3 font-display text-3xl font-semibold text-brand-ink">
            <span v-if="metricsLoading" class="text-brand-gray">…</span>
            <span v-else>{{ kpi.value }}</span>
          </p>
          <p class="mt-2 text-xs text-brand-gray">
            <span v-if="metricsLoading">Carregando métricas…</span>
            <span v-else>{{ kpi.hint }}</span>
          </p>
        </article>
      </div>

      <p
        v-if="!metricsLoading && metricsUnavailable"
        class="rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-brand-gray"
        role="status"
      >
        Métricas do painel ainda não estão disponíveis nesta conta (
        <code class="text-xs">GET /api/dashboard/metrics</code>
        ). Os cartões e o gráfico serão preenchidos quando o backend expuser esses dados.
      </p>

      <div class="grid gap-4 xl:grid-cols-3">
        <section class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm xl:col-span-2">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 class="font-display text-lg font-semibold text-brand-ink">Volume de mensagens</h2>
              <p class="mt-1 text-sm text-brand-gray">
                Envio e recebimento ao longo do período.
              </p>
            </div>
            <span
              class="rounded-full bg-brand-mist px-2.5 py-1 text-xs font-medium text-brand-indigo"
            >
              {{ volumePeriodLabel }}
            </span>
          </div>

          <div class="mt-3 flex flex-wrap items-center gap-4 text-xs text-brand-gray">
            <span class="inline-flex items-center gap-1.5">
              <span class="h-2.5 w-2.5 rounded-full bg-brand-indigo" />
              Enviadas
            </span>
            <span class="inline-flex items-center gap-1.5">
              <span class="h-2.5 w-2.5 rounded-full bg-brand-coral/80" />
              Recebidas
            </span>
          </div>

          <MessageVolumeChart
            v-if="!metricsLoading && hasVolumeChart && metrics?.message_volume"
            :volume="metrics.message_volume"
          />

          <div
            v-else
            class="mt-6 flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center"
          >
            <BarChart3 class="h-8 w-8 text-slate-300" aria-hidden="true" />
            <p class="text-sm font-medium text-brand-ink">Sem dados para exibir</p>
            <p class="max-w-xs text-xs text-brand-gray">
              O gráfico usa a série em
              <code class="text-[11px]">message_volume</code>
              retornada pela API de métricas do painel.
            </p>
          </div>
        </section>

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
                Configure boas-vindas, mensagens fora do horário e respostas por palavra-chave.
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
      </div>

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
