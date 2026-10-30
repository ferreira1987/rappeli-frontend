<script setup lang="ts">
import {
  BarChart3,
  CircleHelp,
  Info,
  Link2,
  MessageSquare,
  PlusSquare,
  Timer,
  UserCheck,
  UserPlus,
  Users,
} from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import { fetchKeywordRules, fetchOutOfHoursAutoReply, fetchWelcomeAutoReply } from '@/api/autoReplies'
import { fetchDashboardMetrics } from '@/api/dashboard'
import { fetchInboxConversations } from '@/api/inbox'
import { fetchPendingTeamInvitations, fetchTeamAgents } from '@/api/team'
import MessageVolumeChart from '@/components/dashboard/MessageVolumeChart.vue'
import AppPageShell from '@/components/layout/AppPageShell.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiCard from '@/components/ui/UiCard.vue'
import { panelBreadcrumbs } from '@/constants/panelBreadcrumbs'
import { useAuthStore } from '@/stores/auth'
import { useWhatsAppStore } from '@/stores/whatsapp'
import type { DashboardMetrics } from '@/types/dashboard'
import { formatAverageResponseTime, formatDashboardCount } from '@/utils/formatDashboard'
import { formatBrazilPhone } from '@/utils/phone'

const auth = useAuthStore()
const whatsappStore = useWhatsAppStore()

const metrics = ref<DashboardMetrics | null>(null)
const metricsLoading = ref(true)
const activeConversationsCount = ref<number | null>(null)

const whatsappConnected = computed(() => whatsappStore.hydrated && whatsappStore.connected)

const welcomeFirstName = computed(() => {
  const name = auth.user?.name?.trim()
  if (!name) {
    return 'por aqui'
  }
  return name.split(/\s+/)[0] ?? name
})

const stepWhatsappDone = computed(() => whatsappConnected.value)

const stepTeamDone = ref(false)
const stepAutoReplyDone = ref(false)
const onboardingChecksLoading = ref(true)

const onboardingCompletedCount = computed(() => {
  let count = 0
  if (stepWhatsappDone.value) count += 1
  if (stepTeamDone.value) count += 1
  if (stepAutoReplyDone.value) count += 1
  return count
})

const onboardingProgressPercent = computed(() =>
  Math.round((onboardingCompletedCount.value / 3) * 100),
)

const showOnboardingCard = computed(
  () => onboardingChecksLoading.value || onboardingCompletedCount.value < 3,
)

const supportMailto = 'mailto:contato@rappeli.com.br'

const whatsappHeaderLabel = computed(() => {
  if (!whatsappStore.hydrated) {
    return null
  }
  if (!whatsappStore.connected) {
    return null
  }
  const formatted = formatBrazilPhone(whatsappStore.displayPhoneNumber)
  return formatted || whatsappStore.displayPhoneNumber || 'Conectado'
})

type MetricCard = {
  key: string
  label: string
  icon: typeof MessageSquare
  value: string | null
  state: 'waiting_connection' | 'loading' | 'empty' | 'value'
}

const metricCards = computed((): MetricCard[] => {
  const data = metrics.value

  if (!whatsappConnected.value) {
    return [
      {
        key: 'active_conversations',
        label: 'Conversas ativas',
        icon: MessageSquare,
        value: null,
        state: 'waiting_connection',
      },
      {
        key: 'response_time',
        label: 'Tempo médio de resposta',
        icon: Timer,
        value: null,
        state: 'waiting_connection',
      },
      {
        key: 'new_contacts',
        label: 'Novos contatos hoje',
        icon: UserPlus,
        value: null,
        state: 'waiting_connection',
      },
      {
        key: 'resolution_rate',
        label: 'Taxa de resolução',
        icon: UserCheck,
        value: null,
        state: 'waiting_connection',
      },
    ]
  }

  if (metricsLoading.value) {
    return [
      {
        key: 'active_conversations',
        label: 'Conversas ativas',
        icon: MessageSquare,
        value: null,
        state: 'loading',
      },
      {
        key: 'response_time',
        label: 'Tempo médio de resposta',
        icon: Timer,
        value: null,
        state: 'loading',
      },
      {
        key: 'new_contacts',
        label: 'Novos contatos hoje',
        icon: UserPlus,
        value: null,
        state: 'loading',
      },
      {
        key: 'resolution_rate',
        label: 'Taxa de resolução',
        icon: UserCheck,
        value: null,
        state: 'loading',
      },
    ]
  }

  const activeRaw =
    activeConversationsCount.value ?? data?.conversations_today ?? null
  const activeFormatted =
    activeRaw != null ? formatDashboardCount(activeRaw) : null

  const responseFormatted = formatAverageResponseTime(data?.average_response_time_seconds)
  const contactsFormatted = formatDashboardCount(data?.new_contacts_today)

  function valueState(formatted: string | null): MetricCard['state'] {
    if (formatted == null || formatted === '—') {
      return 'empty'
    }
    return 'value'
  }

  return [
    {
      key: 'active_conversations',
      label: 'Conversas ativas',
      icon: MessageSquare,
      value: activeFormatted,
      state: valueState(activeFormatted),
    },
    {
      key: 'response_time',
      label: 'Tempo médio de resposta',
      icon: Timer,
      value: responseFormatted,
      state: valueState(responseFormatted),
    },
    {
      key: 'new_contacts',
      label: 'Novos contatos hoje',
      icon: UserPlus,
      value: contactsFormatted,
      state: valueState(contactsFormatted),
    },
    {
      key: 'resolution_rate',
      label: 'Taxa de resolução',
      icon: UserCheck,
      value: null,
      state: 'empty',
    },
  ]
})

function metricPlaceholderLabel(card: MetricCard): string {
  if (card.state === 'waiting_connection') {
    return 'Aguardando conexão'
  }
  if (card.state === 'loading') {
    return 'Carregando…'
  }
  return 'Sem dados ainda'
}

const volumePeriodLabel = computed(() => {
  const days = metrics.value?.message_volume?.period_days
  if (days == null || days <= 0) {
    return '7 dias'
  }
  return days === 1 ? '1 dia' : `${days} dias`
})

const hasVolumeChart = computed(
  () => (metrics.value?.message_volume?.points.length ?? 0) > 0,
)

async function loadOnboardingProgress(): Promise<void> {
  onboardingChecksLoading.value = true
  try {
    const [agents, invitations, welcome, outOfHours, keywordRules] = await Promise.all([
      fetchTeamAgents().catch(() => []),
      fetchPendingTeamInvitations().catch(() => []),
      fetchWelcomeAutoReply().catch(() => null),
      fetchOutOfHoursAutoReply().catch(() => null),
      fetchKeywordRules().catch(() => []),
    ])
    stepTeamDone.value = agents.length > 1 || invitations.length > 0
    stepAutoReplyDone.value =
      welcome?.enabled === true ||
      outOfHours?.enabled === true ||
      (keywordRules?.length ?? 0) > 0
  } finally {
    onboardingChecksLoading.value = false
  }
}

async function loadDashboard(): Promise<void> {
  metricsLoading.value = true
  try {
    metrics.value = await fetchDashboardMetrics()
  } catch {
    metrics.value = null
  } finally {
    metricsLoading.value = false
  }

  if (whatsappStore.hydrated && whatsappStore.connected) {
    try {
      const page = await fetchInboxConversations({ per_page: 1 })
      activeConversationsCount.value = page.counts?.all ?? null
    } catch {
      activeConversationsCount.value = null
    }
  } else {
    activeConversationsCount.value = null
  }

  if (!whatsappStore.hydrated) {
    await whatsappStore.refresh()
  }

  void loadOnboardingProgress()
}

onMounted(() => {
  void loadDashboard()
})
</script>

<template>
  <AppPageShell title="Painel" :breadcrumbs="panelBreadcrumbs({ label: 'Painel' })">
    <template #actions>
      <a :href="supportMailto" class="inline-flex">
        <UiButton variant="secondary" size="sm" class="gap-2 font-medium">
          <CircleHelp class="h-4 w-4 text-brand-gray" aria-hidden="true" />
          <span class="hidden sm:inline">Ajuda &amp; Tutoriais</span>
          <span class="sm:hidden">Ajuda</span>
        </UiButton>
      </a>
      <RouterLink
        v-if="whatsappStore.hydrated && !whatsappStore.connected"
        :to="{ name: 'configuracoes-whatsapp' }"
        class="inline-flex"
      >
        <UiButton size="sm" class="gap-2">
          <Link2 class="h-4 w-4" aria-hidden="true" />
          Conectar WhatsApp
        </UiButton>
      </RouterLink>
      <span
        v-else-if="whatsappHeaderLabel"
        class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-brand-ink"
      >
        <span class="h-2 w-2 rounded-full bg-amber-400" aria-hidden="true" />
        {{ whatsappHeaderLabel }}
      </span>
    </template>

    <div class="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <section class="space-y-2">
        <h2 class="text-2xl font-bold tracking-tight text-brand-ink sm:text-3xl">
          Bem-vindo ao Rappeli, {{ welcomeFirstName }}! Vamos começar.
        </h2>
        <p class="max-w-3xl text-sm leading-relaxed text-brand-gray sm:text-base">
          Complete os passos abaixo para liberar métricas de atendimento e começar a conversar com
          seus clientes pelo WhatsApp.
        </p>
      </section>

      <UiCard v-if="showOnboardingCard" padding="none" class="overflow-hidden">
        <div class="border-b border-slate-100 px-5 py-4 sm:px-6">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h3 class="text-base font-semibold text-brand-ink">Configure sua conta</h3>
            <p class="text-sm text-brand-gray">
              Progresso:
              <span class="font-semibold text-brand-ink">{{ onboardingCompletedCount }} de 3</span>
              concluídos
            </p>
          </div>
          <div
            class="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            :aria-valuenow="onboardingProgressPercent"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-label="`Progresso do onboarding: ${onboardingProgressPercent}%`"
          >
            <div
              class="h-full rounded-full bg-brand-indigo transition-all duration-300"
              :style="{ width: `${onboardingProgressPercent}%` }"
            />
          </div>
        </div>

        <ol class="divide-y divide-slate-100">
          <li class="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-start sm:px-6">
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
              :class="
                stepWhatsappDone
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-brand-indigo text-white'
              "
            >
              {{ stepWhatsappDone ? '✓' : '1' }}
            </div>
            <div class="min-w-0 flex-1 space-y-1">
              <div class="flex flex-wrap items-center gap-2">
                <p class="font-semibold text-brand-ink">Conectar número de WhatsApp</p>
                <UiBadge v-if="!stepWhatsappDone" variant="primary" size="md">
                  Recomendado primeiro
                </UiBadge>
              </div>
              <p class="text-sm text-brand-gray">
                Vincule o WhatsApp Business da sua empresa para receber e responder mensagens pelo
                painel.
              </p>
            </div>
            <RouterLink
              v-if="!stepWhatsappDone"
              :to="{ name: 'configuracoes-whatsapp' }"
              class="inline-flex shrink-0 sm:mt-1"
            >
              <UiButton size="sm">Conectar agora</UiButton>
            </RouterLink>
            <UiBadge v-else variant="success" size="md" class="shrink-0 sm:mt-1">Concluído</UiBadge>
          </li>

          <li
            class="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-start sm:px-6"
            :class="!stepWhatsappDone ? 'opacity-60' : ''"
          >
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-bold text-brand-gray"
            >
              {{ stepTeamDone ? '✓' : '2' }}
            </div>
            <div class="min-w-0 flex-1 space-y-1">
              <p class="font-semibold text-brand-ink">Convidar membros da equipe</p>
              <p class="text-sm text-brand-gray">
                Adicione recepcionistas e outros profissionais para dividir o atendimento.
              </p>
            </div>
            <RouterLink
              :to="{ name: 'configuracoes', query: { tab: 'equipe' } }"
              class="inline-flex shrink-0 sm:mt-1"
              :class="!stepWhatsappDone ? 'pointer-events-none' : ''"
              :tabindex="stepWhatsappDone ? 0 : -1"
            >
              <UiButton variant="outline" size="sm" :disabled="!stepWhatsappDone" class="gap-2">
                <Users class="h-4 w-4" aria-hidden="true" />
                Convidar equipe
              </UiButton>
            </RouterLink>
          </li>

          <li
            class="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-start sm:px-6"
            :class="!stepWhatsappDone ? 'opacity-60' : ''"
          >
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-bold text-brand-gray"
            >
              {{ stepAutoReplyDone ? '✓' : '3' }}
            </div>
            <div class="min-w-0 flex-1 space-y-1">
              <p class="font-semibold text-brand-ink">Criar primeira resposta automática</p>
              <p class="text-sm text-brand-gray">
                Configure uma mensagem de boas-vindas ou resposta fora do horário comercial.
              </p>
            </div>
            <RouterLink
              :to="{ name: 'respostas-automaticas' }"
              class="inline-flex shrink-0 sm:mt-1"
              :class="!stepWhatsappDone ? 'pointer-events-none' : ''"
              :tabindex="stepWhatsappDone ? 0 : -1"
            >
              <UiButton variant="outline" size="sm" :disabled="!stepWhatsappDone" class="gap-2">
                <PlusSquare class="h-4 w-4" aria-hidden="true" />
                Configurar resposta
              </UiButton>
            </RouterLink>
          </li>
        </ol>

        <div
          v-if="!stepWhatsappDone"
          class="flex gap-3 border-t border-slate-100 bg-slate-50/80 px-5 py-4 text-sm text-brand-gray sm:px-6"
        >
          <Info class="mt-0.5 h-4 w-4 shrink-0 text-brand-gray" aria-hidden="true" />
          <p>
            Assim que o WhatsApp estiver conectado, as métricas de atendimento abaixo começam a ser
            atualizadas automaticamente.
          </p>
        </div>
      </UiCard>

      <section class="space-y-4">
        <div class="flex flex-wrap items-end justify-between gap-2">
          <h3 class="text-lg font-bold text-brand-ink">Métricas de Atendimento</h3>
          <span class="text-sm text-brand-gray">Visão consolidada</span>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <UiCard v-for="card in metricCards" :key="card.key" padding="md">
            <div class="flex items-start justify-between gap-2">
              <p class="text-sm font-medium text-brand-gray">{{ card.label }}</p>
              <component :is="card.icon" class="h-5 w-5 text-slate-300" aria-hidden="true" />
            </div>

            <template v-if="card.state !== 'value'">
              <div
                class="mt-4 h-9 w-24 max-w-full rounded-md bg-slate-100"
                aria-hidden="true"
              />
              <UiBadge variant="neutral" size="md" class="mt-4 gap-1.5">
                <span class="h-1.5 w-1.5 rounded-full bg-slate-300" aria-hidden="true" />
                {{ metricPlaceholderLabel(card) }}
              </UiBadge>
            </template>
            <template v-else>
              <p class="mt-3 text-3xl font-bold tracking-tight text-brand-ink">
                {{ card.value }}
              </p>
            </template>
          </UiCard>
        </div>

        <UiCard padding="md" class="mt-4">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h4 class="text-base font-semibold text-brand-ink">Volume de mensagens</h4>
              <p class="mt-1 text-sm text-brand-gray">
                Envio e recebimento ao longo do período.
              </p>
            </div>
            <UiBadge variant="primary" size="md">{{ volumePeriodLabel }}</UiBadge>
          </div>

          <div class="mt-3 flex flex-wrap items-center gap-4 text-xs text-brand-gray">
            <span class="inline-flex items-center gap-1.5">
              <span class="h-2.5 w-2.5 rounded-full bg-brand-indigo" aria-hidden="true" />
              Enviadas
            </span>
            <span class="inline-flex items-center gap-1.5">
              <span class="h-2.5 w-2.5 rounded-full bg-slate-400" aria-hidden="true" />
              Recebidas
            </span>
          </div>

          <MessageVolumeChart
            v-if="!metricsLoading && hasVolumeChart && metrics?.message_volume"
            :volume="metrics.message_volume"
          />

          <div
            v-else
            class="mt-4 flex h-48 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center"
          >
            <BarChart3 class="h-8 w-8 text-slate-300" aria-hidden="true" />
            <p class="text-sm font-medium text-brand-ink">
              {{
                !whatsappConnected && !metricsLoading
                  ? 'Aguardando conexão do WhatsApp'
                  : 'Sem dados para exibir'
              }}
            </p>
            <p class="max-w-sm px-4 text-xs text-brand-gray">
              {{
                !whatsappConnected && !metricsLoading
                  ? 'Conecte o WhatsApp para acompanhar o volume de mensagens enviadas e recebidas.'
                  : 'O gráfico usa a série message_volume retornada pela API de métricas do painel.'
              }}
            </p>
          </div>
        </UiCard>
      </section>

      <AppPageFooter />
    </div>
  </AppPageShell>
</template>
