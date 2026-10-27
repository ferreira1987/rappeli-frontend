<script setup lang="ts">
import { CheckCircle2, Download, Filter, Hourglass, Loader2, TrendingUp } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'

import { downloadReportExport, fetchReport } from '@/api/reports'
import ExampleFiltersModal from '@/components/app/ExampleFiltersModal.vue'
import AppPageHeader from '@/components/app/AppPageHeader.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import { initialsFromName } from '@/composables/useInitials'
import type { ReportPayload, ReportPeriod } from '@/types/reports'
import { formatAverageResponseTime } from '@/utils/formatDashboard'
import { getErrorMessage } from '@/utils/errors'
import { pluralizePt } from '@/utils/pluralize'

const tab = ref<'overview' | 'agent' | 'campaign'>('agent')
const filtersOpen = ref(false)
const period = ref<ReportPeriod>('7d')
const loading = ref(true)
const error = ref<string | null>(null)
const report = ref<ReportPayload | null>(null)
const exportMessage = ref<string | null>(null)

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

const kpiCards = computed(() => {
  const kpis = report.value?.kpis
  const days = kpis?.period_days ?? 7
  const periodHint = days === 1 ? 'Último dia' : `Últimos ${days} dias`
  return [
    {
      label: 'Tempo médio de resposta',
      value: formatAverageResponseTime(kpis?.average_response_time_seconds ?? null),
      hint: periodHint,
      icon: null,
    },
    {
      label: 'Conversas atendidas',
      value: String(kpis?.conversations_handled ?? 0),
      hint: periodHint,
      icon: TrendingUp,
    },
    {
      label: 'Novos contatos',
      value: String(kpis?.new_contacts ?? 0),
      hint: periodHint,
      icon: CheckCircle2,
    },
    {
      label: 'Mensagens automáticas',
      value: String(kpis?.automated_messages ?? 0),
      hint: periodHint,
      icon: Hourglass,
    },
  ]
})

function readRate(row: { sent_count: number; read_count: number }): string {
  if (!row.sent_count) return '—'
  const pct = Math.round((row.read_count / row.sent_count) * 100)
  return `${pct}%`
}

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
  <div class="flex min-h-full flex-col bg-brand-mist">
    <AppPageHeader
      title="Relatórios"
      :breadcrumbs="[{ label: 'Painel', to: '/painel' }, { label: 'Relatórios' }]"
    >
      <template #actions>
        <select
          v-model="period"
          class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          @change="loadReport"
        >
          <option v-for="opt in periodOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium"
          @click="filtersOpen = true"
        >
          <Filter class="h-4 w-4" /> Filtros
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"
          @click="exportCsv"
        >
          <Download class="h-4 w-4" /> Exportar CSV
        </button>
      </template>
    </AppPageHeader>

    <div class="border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
      <div class="flex gap-6">
        <button
          v-for="item in [
            { key: 'overview', label: 'Visão geral' },
            { key: 'agent', label: 'Por atendente' },
            { key: 'campaign', label: 'Por campanha' },
          ]"
          :key="item.key"
          type="button"
          class="border-b-2 py-3 text-sm font-semibold"
          :class="
            tab === item.key
              ? 'border-brand-indigo text-brand-indigo'
              : 'border-transparent text-brand-gray hover:text-brand-ink'
          "
          @click="tab = item.key as typeof tab"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <div class="flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <p v-if="exportMessage" class="text-sm text-brand-indigo" role="status">{{ exportMessage }}</p>

      <div v-if="loading" class="flex justify-center py-16">
        <Loader2 class="h-8 w-8 animate-spin text-brand-indigo" aria-label="Carregando relatório" />
      </div>

      <div v-else-if="error" class="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p class="text-sm text-red-800">{{ error }}</p>
        <button type="button" class="mt-3 rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white" @click="loadReport">
          Tentar novamente
        </button>
      </div>

      <template v-else-if="report">
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div
            v-for="card in kpiCards"
            :key="card.label"
            class="relative rounded-xl border border-slate-200 bg-white p-4 shadow-xs"
          >
            <p class="text-xs font-medium text-brand-gray">{{ card.label }}</p>
            <p class="mt-2 font-display text-2xl font-bold text-brand-ink">{{ card.value }}</p>
            <p class="mt-1 flex items-center gap-1 text-xs text-brand-gray">
              <component :is="card.icon" v-if="card.icon" class="h-3.5 w-3.5 text-emerald-600" />
              {{ card.hint }}
            </p>
          </div>
        </div>

        <p v-if="tab === 'overview'" class="text-sm text-brand-gray">
          Métricas detalhadas por atendente e campanha estão nas abas correspondentes. KPIs de resolvidas/em aberto
          ainda não são expostos pela API.
        </p>

        <section v-if="tab === 'agent'" class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div class="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 class="font-display text-base font-bold text-brand-ink">Desempenho por atendente</h2>
              <p class="text-xs text-brand-gray">Dados do período selecionado</p>
            </div>
            <p class="text-xs text-brand-gray">
              {{ pluralizePt(report.agents.length, 'colaborador') }} listados
            </p>
          </div>
          <div class="mt-4 overflow-x-auto">
            <table class="w-full min-w-[480px] text-sm">
              <thead class="border-b border-slate-100 text-[11px] font-bold uppercase text-brand-gray">
                <tr>
                  <th class="py-2 text-left">Colaborador</th>
                  <th class="px-2 py-2 text-right">Conversas atendidas</th>
                  <th class="px-2 py-2 text-right">Mensagens enviadas</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="row in report.agents" :key="row.user_id">
                  <td class="py-3">
                    <div class="flex items-center gap-2">
                      <span class="flex h-8 w-8 items-center justify-center rounded-full bg-brand-mist text-xs font-bold text-brand-indigo">
                        {{ initialsFromName(row.name) }}
                      </span>
                      <span class="font-medium text-brand-ink">{{ row.name }}</span>
                    </div>
                  </td>
                  <td class="px-2 py-3 text-right">{{ row.conversations_handled }}</td>
                  <td class="px-2 py-3 text-right">{{ row.messages_sent }}</td>
                </tr>
                <tr v-if="!report.agents.length">
                  <td colspan="3" class="py-6 text-center text-brand-gray">Nenhum dado no período.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section v-if="tab === 'campaign'" class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <h2 class="font-display text-base font-bold text-brand-ink">Desempenho por campanha</h2>
          <p class="text-xs text-brand-gray">Contagens registradas no sistema (disparo automático: Em breve)</p>
          <table class="mt-4 w-full text-sm">
            <thead class="border-b border-slate-100 text-left text-[11px] font-bold uppercase text-brand-gray">
              <tr>
                <th class="py-2">Campanha</th>
                <th class="px-2 py-2">Status</th>
                <th class="px-2 py-2 text-right">Enviadas</th>
                <th class="px-2 py-2 text-right">Entregues</th>
                <th class="px-2 py-2 text-right">Taxa de leitura</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="row in report.campaigns" :key="row.id">
                <td class="py-2 font-medium text-brand-ink">{{ row.name }}</td>
                <td class="px-2 py-2 capitalize text-brand-gray">{{ row.status }}</td>
                <td class="px-2 py-2 text-right">{{ row.sent_count }}</td>
                <td class="px-2 py-2 text-right">{{ row.delivered_count }}</td>
                <td class="px-2 py-2 text-right">{{ readRate(row) }}</td>
              </tr>
              <tr v-if="!report.campaigns.length">
                <td colspan="5" class="py-6 text-center text-brand-gray">Nenhuma campanha cadastrada.</td>
              </tr>
            </tbody>
          </table>
        </section>
      </template>

      <AppPageFooter />
    </div>

    <ExampleFiltersModal
      :open="filtersOpen"
      title="Filtros de relatórios"
      @close="filtersOpen = false"
      @apply="filtersOpen = false"
    />
  </div>
</template>
