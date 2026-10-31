<script setup lang="ts">
import {
  AlertTriangle,
  BarChart3,
  Bot,
  Calendar,
  CheckCircle2,
  Download,
  Filter,
  Loader2,
  MessageSquareMore,
  NotebookPen,
  Timer,
  TrendingUp,
  UserPlus,
} from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'

import { downloadReportExport, fetchReport } from '@/api/reports'
import ExampleFiltersModal from '@/components/app/ExampleFiltersModal.vue'
import ReportConversationVolumeChart from '@/components/reports/ReportConversationVolumeChart.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import AppPageShell from '@/components/layout/AppPageShell.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiFilterChip from '@/components/ui/UiFilterChip.vue'
import UiFilterChipGroup from '@/components/ui/UiFilterChipGroup.vue'
import UiTable from '@/components/ui/UiTable.vue'
import { initialsFromName } from '@/composables/useInitials'
import { panelBreadcrumbs } from '@/constants/panelBreadcrumbs'
import type { ReportPayload, ReportPeriod } from '@/types/reports'
import { formatAverageResponseTime } from '@/utils/formatDashboard'
import { getErrorMessage } from '@/utils/errors'
import { pluralizePt } from '@/utils/pluralize'
import {
  findPeakVolumeDay,
  normalizeConversationVolume,
} from '@/utils/reportConversationVolume'
import {
  buildReportStatusSegments,
  resolutionEfficiencyLabel,
} from '@/utils/reportStatusDistribution'
import { formatReportAgentDisplayName } from '@/utils/teamLabels'

const tab = ref<'overview' | 'agent' | 'campaign'>('overview')
const filtersOpen = ref(false)
const period = ref<ReportPeriod>('7d')
const loading = ref(true)
const error = ref<string | null>(null)
const report = ref<ReportPayload | null>(null)
const exportMessage = ref<string | null>(null)

const headerBreadcrumbs = panelBreadcrumbs({ label: 'Gestão' }, { label: 'Relatórios' })

const viewChips = [
  { key: 'overview' as const, label: 'Visão geral' },
  { key: 'agent' as const, label: 'Por atendente' },
  { key: 'campaign' as const, label: 'Por campanha' },
]

const periodOptions: { value: ReportPeriod; label: string }[] = [
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
]

async function loadReport(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    report.value = await fetchReport(period.value)
  } catch (err) {
    error.value = getErrorMessage(err)
    report.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadReport()
})

const periodHint = computed(() => {
  const days = report.value?.kpis?.period_days ?? (period.value === '30d' ? 30 : 7)
  return days === 1 ? 'Último dia' : `Últimos ${days} dias`
})

const kpiCards = computed(() => {
  const kpis = report.value?.kpis
  const hint = periodHint.value
  const firstResponseAggregation = report.value?.meta?.first_response_time_aggregation
  const firstResponseHint =
    firstResponseAggregation === 'average'
      ? `Média no período (mesma regra da visão Por atendente) · ${hint}`
      : `Até a primeira mensagem do atendente · ${hint}`

  const handled = kpis?.conversations_handled ?? 0
  const resolved = kpis?.conversations_resolved ?? 0
  const resolutionRateHint =
    handled > 0
      ? `${Math.round((resolved / handled) * 100)}% taxa de resolução · ${hint}`
      : hint

  return [
    {
      key: 'first_response',
      label: 'Tempo médio de 1ª resposta',
      value: formatAverageResponseTime(kpis?.average_first_response_time_seconds ?? null),
      hint: firstResponseHint,
      hintClass: 'text-brand-gray',
      icon: Timer,
      visible: kpis?.average_first_response_time_seconds != null,
    },
    {
      key: 'handled',
      label: 'Conversas atendidas',
      value: String(handled),
      hint: hint,
      hintClass: 'text-emerald-700',
      icon: TrendingUp,
      visible: true,
    },
    {
      key: 'resolved',
      label: 'Conversas resolvidas',
      value: String(resolved),
      hint: resolutionRateHint,
      hintClass: 'text-brand-indigo',
      icon: CheckCircle2,
      visible: true,
    },
    {
      key: 'open',
      label: 'Conversas em aberto',
      value: String(kpis?.conversations_open ?? 0),
      hint: 'Em andamento · ' + hint,
      hintClass: 'text-brand-gray',
      icon: MessageSquareMore,
      visible: true,
    },
    {
      key: 'unassigned',
      label: 'Em aberto sem atendente',
      value: String(kpis?.conversations_open_unassigned ?? 0),
      hint: 'Aguardando triagem · ' + hint,
      hintClass: 'text-amber-800',
      icon: AlertTriangle,
      visible: true,
    },
    {
      key: 'response_time',
      label: 'Tempo médio de resposta',
      value: formatAverageResponseTime(kpis?.average_response_time_seconds ?? null),
      hint: 'Entre mensagens no período · ' + hint,
      hintClass: 'text-brand-gray',
      icon: NotebookPen,
      visible: kpis?.average_response_time_seconds != null,
    },
    {
      key: 'new_contacts',
      label: 'Novos contatos',
      value: String(kpis?.new_contacts ?? 0),
      hint: hint,
      hintClass: 'text-emerald-700',
      icon: UserPlus,
      visible: true,
    },
    {
      key: 'automated',
      label: 'Mensagens automáticas',
      value: String(kpis?.automated_messages ?? 0),
      hint: hint,
      hintClass: 'text-brand-gray',
      icon: Bot,
      visible: true,
    },
  ].filter((card) => card.visible)
})

const conversationVolumePoints = computed(() =>
  normalizeConversationVolume(report.value?.conversation_volume),
)

const hasConversationVolumeChart = computed(() => conversationVolumePoints.value.length > 0)

const volumePeakLabel = computed(() => {
  const peak = findPeakVolumeDay(conversationVolumePoints.value)
  if (!peak) {
    return null
  }
  const date = new Date(`${peak.date}T12:00:00`)
  const dayName = Number.isNaN(date.getTime())
    ? peak.date
    : date.toLocaleDateString('pt-BR', { weekday: 'long' })
  const capitalized = dayName.charAt(0).toUpperCase() + dayName.slice(1)
  return `Pico registrado na ${capitalized} (${peak.handled} conversas)`
})

const statusSegments = computed(() =>
  buildReportStatusSegments(report.value?.kpis ?? {}),
)

const resolutionEfficiency = computed(() => {
  const kpis = report.value?.kpis
  if (!kpis) {
    return null
  }
  return resolutionEfficiencyLabel(kpis.conversations_handled, kpis.conversations_resolved)
})

function readRate(row: { sent_count: number; read_count: number }): string {
  if (!row.sent_count) return '—'
  const pct = Math.round((row.read_count / row.sent_count) * 100)
  return `${pct}%`
}

const unassignedOpenConversations = computed(
  () => report.value?.kpis?.conversations_open_unassigned ?? 0,
)

async function exportCsv(): Promise<void> {
  exportMessage.value = null
  try {
    const blob = await downloadReportExport(period.value)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `relatorio-${period.value}.csv`
    link.click()
    URL.revokeObjectURL(url)
    exportMessage.value = 'CSV exportado com sucesso.'
  } catch (err) {
    exportMessage.value = getErrorMessage(err)
  }
}
</script>

<template>
  <AppPageShell title="Relatórios" :breadcrumbs="headerBreadcrumbs">
    <template #actions>
      <label class="relative inline-flex items-center">
        <span class="sr-only">Período do relatório</span>
        <Calendar
          class="pointer-events-none absolute left-3 h-4 w-4 text-brand-gray"
          aria-hidden="true"
        />
        <select
          id="report-period"
          v-model="period"
          aria-label="Período do relatório"
          class="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-8 text-sm font-medium text-brand-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-indigo"
          @change="loadReport"
        >
          <option v-for="opt in periodOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </label>
      <UiButton variant="secondary" @click="filtersOpen = true">
        <Filter class="h-4 w-4 text-brand-gray" aria-hidden="true" />
        Filtros
      </UiButton>
      <UiButton variant="secondary" @click="exportCsv">
        <Download class="h-4 w-4" aria-hidden="true" />
        Exportar CSV
      </UiButton>
    </template>

    <template #toolbar>
      <UiFilterChipGroup label="Visão do relatório">
        <UiFilterChip
          v-for="item in viewChips"
          :key="item.key"
          :active="tab === item.key"
          @click="tab = item.key"
        >
          {{ item.label }}
        </UiFilterChip>
      </UiFilterChipGroup>
    </template>

    <div class="flex min-h-0 flex-1 flex-col space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <p v-if="exportMessage" class="text-sm text-brand-indigo" role="status">{{ exportMessage }}</p>

      <div v-if="loading" class="flex justify-center py-16">
        <Loader2 class="h-8 w-8 animate-spin text-brand-indigo" aria-label="Carregando relatório" />
      </div>

      <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p class="text-sm text-red-800">{{ error }}</p>
        <UiButton class="mt-3" @click="loadReport">Tentar novamente</UiButton>
      </div>

      <template v-else-if="report">
        <template v-if="tab === 'overview'">
          <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <UiCard v-for="card in kpiCards" :key="card.key" padding="md">
              <div class="flex items-start justify-between gap-2">
                <p class="text-sm font-medium text-brand-gray">{{ card.label }}</p>
                <component
                  :is="card.icon"
                  class="h-5 w-5 shrink-0 text-slate-300"
                  aria-hidden="true"
                />
              </div>
              <p class="mt-3 text-3xl font-bold tracking-tight text-brand-ink">
                {{ card.value }}
              </p>
              <p class="mt-2 text-xs" :class="card.hintClass">
                {{ card.hint }}
              </p>
            </UiCard>
          </div>

          <div class="grid gap-4 lg:grid-cols-3">
            <UiCard padding="md" class="lg:col-span-2">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 class="text-base font-semibold text-brand-ink">Volume de conversas por dia</h2>
                  <p class="mt-1 text-sm text-brand-gray">
                    Comparativo diário entre conversas iniciadas e resolvidas.
                  </p>
                </div>
                <UiBadge variant="primary" size="md">{{ periodHint }}</UiBadge>
              </div>

              <div class="mt-3 flex flex-wrap items-center gap-4 text-xs text-brand-gray">
                <span class="inline-flex items-center gap-1.5">
                  <span class="h-2.5 w-2.5 rounded-sm bg-brand-indigo" aria-hidden="true" />
                  Atendidas
                </span>
                <span class="inline-flex items-center gap-1.5">
                  <span class="h-2.5 w-2.5 rounded-sm bg-slate-300" aria-hidden="true" />
                  Resolvidas
                </span>
              </div>

              <ReportConversationVolumeChart
                v-if="hasConversationVolumeChart"
                :points="conversationVolumePoints"
              />

              <div
                v-else
                class="mt-4 flex h-48 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center"
              >
                <BarChart3 class="h-8 w-8 text-slate-300" aria-hidden="true" />
                <p class="text-sm font-medium text-brand-ink">Sem série diária no período</p>
                <p class="max-w-md px-4 text-xs text-brand-gray">
                  Ainda não há dados de volume de conversas no período. Os KPIs acima continuam
                  refletindo o período selecionado.
                </p>
              </div>

              <div
                class="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 text-xs text-brand-gray sm:flex-row sm:items-center sm:justify-between"
              >
                <p>{{ volumePeakLabel ?? 'Aguardando série diária da API.' }}</p>
                <p>
                  Total no período:
                  <span class="font-semibold text-brand-ink">
                    {{ report.kpis?.conversations_handled ?? 0 }}
                  </span>
                  atendimentos
                </p>
              </div>
            </UiCard>

            <UiCard padding="md">
              <div>
                <h2 class="text-base font-semibold text-brand-ink">Canais e status das conversas</h2>
                <p class="mt-1 text-sm text-brand-gray">
                  Distribuição com base nos totais retornados pela API no período selecionado.
                </p>
              </div>

              <ul class="mt-5 space-y-4">
                <li v-for="segment in statusSegments" :key="segment.key">
                  <div class="flex items-center justify-between gap-2 text-sm">
                    <span class="font-medium text-brand-ink">{{ segment.label }}</span>
                    <span class="tabular-nums text-brand-gray">
                      {{ segment.percent }}%
                      <span class="text-brand-gray">({{ segment.count }})</span>
                    </span>
                  </div>
                  <div
                    class="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
                    role="presentation"
                  >
                    <div
                      class="h-full rounded-full transition-all"
                      :class="segment.barClass"
                      :style="{ width: `${segment.percent}%` }"
                    />
                  </div>
                </li>
              </ul>

              <div
                v-if="resolutionEfficiency"
                class="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3"
              >
                <p class="text-xs font-medium text-brand-gray">Eficiência de resolução</p>
                <UiBadge variant="success" size="md" class="mt-2">
                  {{ resolutionEfficiency }}
                </UiBadge>
              </div>
            </UiCard>
          </div>

          <p class="text-sm text-brand-gray">
            Use as visões
            <strong class="font-semibold text-brand-ink">Por atendente</strong> e
            <strong class="font-semibold text-brand-ink">Por campanha</strong> para ver o
            detalhamento tabular.
          </p>

          <p
            v-if="unassignedOpenConversations > 0"
            class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
            role="note"
          >
            {{
              pluralizePt(unassignedOpenConversations, 'conversa', {
                one: 'conversa em aberto',
                other: 'conversas em aberto',
              })
            }}
            sem atendente atribuído. O KPI
            <strong>Em aberto sem atendente</strong> usa o mesmo critério do backend; a soma por
            atendente na visão Por atendente não inclui essas conversas.
          </p>
        </template>

        <UiCard v-if="tab === 'agent'" padding="md">
          <div class="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 class="text-base font-bold text-brand-ink">Desempenho por atendente</h2>
              <p class="text-sm text-brand-gray">Dados do período selecionado</p>
            </div>
            <p class="text-xs text-brand-gray">
              {{
                pluralizePt(report.agents?.length ?? 0, 'colaborador', {
                  one: 'colaborador listado',
                  other: 'colaboradores listados',
                })
              }}
            </p>
          </div>

          <UiTable class="mt-4">
            <thead>
              <tr>
                <th scope="col">Colaborador</th>
                <th scope="col" class="text-right">Atendidas</th>
                <th scope="col" class="text-right">Mensagens</th>
                <th scope="col" class="text-right">Resolvidas</th>
                <th scope="col" class="text-right">Em aberto</th>
                <th scope="col" class="text-right">1ª resposta</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in report.agents ?? []" :key="row.user_id">
                <td>
                  <div class="flex items-center gap-2">
                    <span
                      class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-mist text-xs font-bold text-brand-indigo"
                      aria-hidden="true"
                    >
                      {{ initialsFromName(row.name) }}
                    </span>
                    <span class="font-medium text-brand-ink">
                      {{ formatReportAgentDisplayName(row, report.agents ?? []) }}
                    </span>
                  </div>
                </td>
                <td class="text-right tabular-nums">{{ row.conversations_handled }}</td>
                <td class="text-right tabular-nums">{{ row.messages_sent }}</td>
                <td class="text-right tabular-nums text-emerald-700">
                  {{ row.conversations_resolved }}
                </td>
                <td class="text-right tabular-nums">{{ row.conversations_open }}</td>
                <td class="text-right tabular-nums text-brand-gray">
                  <span v-if="row.average_first_response_time_seconds != null">
                    {{ formatAverageResponseTime(row.average_first_response_time_seconds) }}
                  </span>
                </td>
              </tr>
              <tr v-if="!(report.agents?.length)">
                <td colspan="6" class="py-8 text-center text-brand-gray">
                  Nenhum dado no período.
                </td>
              </tr>
            </tbody>
          </UiTable>
        </UiCard>

        <UiCard v-if="tab === 'campaign'" padding="md">
          <div class="mb-4">
            <h2 class="text-base font-bold text-brand-ink">Desempenho por campanha</h2>
            <p class="text-sm text-brand-gray">Contagens registradas no sistema.</p>
          </div>

          <UiTable>
            <thead>
              <tr>
                <th scope="col">Campanha</th>
                <th scope="col">Status</th>
                <th scope="col" class="text-right">Enviadas</th>
                <th scope="col" class="text-right">Entregues</th>
                <th scope="col" class="text-right">Lidas</th>
                <th scope="col" class="text-right">Falhas</th>
                <th scope="col" class="text-right">Taxa de leitura</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in report.campaigns ?? []" :key="row.id">
                <td class="font-medium text-brand-ink">{{ row.name }}</td>
                <td class="capitalize text-brand-gray">{{ row.status }}</td>
                <td class="text-right tabular-nums">{{ row.sent_count }}</td>
                <td class="text-right tabular-nums">{{ row.delivered_count }}</td>
                <td class="text-right tabular-nums">{{ row.read_count }}</td>
                <td class="text-right tabular-nums">{{ row.failed_count ?? 0 }}</td>
                <td class="text-right tabular-nums">{{ readRate(row) }}</td>
              </tr>
              <tr v-if="!(report.campaigns?.length)">
                <td colspan="7" class="py-8 text-center text-brand-gray">
                  Nenhuma campanha cadastrada.
                </td>
              </tr>
            </tbody>
          </UiTable>
        </UiCard>
      </template>

      <AppPageFooter class="mt-auto" />
    </div>

    <ExampleFiltersModal
      :open="filtersOpen"
      title="Filtros de relatórios"
      @close="filtersOpen = false"
      @apply="filtersOpen = false"
    />
  </AppPageShell>
</template>
