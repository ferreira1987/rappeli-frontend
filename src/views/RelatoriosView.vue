<script setup lang="ts">
import { CheckCircle2, Download, Filter, Hourglass, TrendingUp } from '@lucide/vue'
import { ref } from 'vue'

import ExampleFiltersModal from '@/components/app/ExampleFiltersModal.vue'
import AppPageHeader from '@/components/app/AppPageHeader.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import { useExampleToast } from '@/composables/useExampleToast'
import { initialsFromName } from '@/composables/useInitials'
import {
  exampleAgentPerformance,
  exampleCampaignPerformance,
  exampleReportKpis,
} from '@/services/example'
import { downloadCsv } from '@/utils/exportCsv'
import { pluralizePt } from '@/utils/pluralize'

const tab = ref<'overview' | 'agent' | 'campaign'>('agent')
const filtersOpen = ref(false)
const { message: toast, show: showToast } = useExampleToast()

function exportCsv(): void {
  if (tab.value === 'campaign') {
    downloadCsv(
      'relatorio-campanhas-exemplo.csv',
      ['Campanha', 'Enviadas', 'Entregues', 'Taxa de leitura'],
      exampleCampaignPerformance.map((row) => [
        row.name,
        String(row.sent),
        String(row.delivered),
        row.readRate,
      ]),
    )
  } else {
    downloadCsv(
      'relatorio-atendentes-exemplo.csv',
      ['Atendente', 'Setor', 'Atendidas', 'Resolvidas', 'Em aberto'],
      exampleAgentPerformance.map((row) => [
        row.name,
        row.sector,
        String(row.handled),
        String(row.resolved),
        String(row.open),
      ]),
    )
  }
  showToast('CSV exportado com os dados exibidos (exemplo).')
}

function sectorClass(tone: 'blue' | 'green' | 'red'): string {
  const map = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  }
  return map[tone]
}
</script>

<template>
  <div class="flex min-h-full flex-col bg-brand-mist">
    <AppPageHeader
      title="Relatórios"
      :breadcrumbs="[{ label: 'Painel', to: '/painel' }, { label: 'Relatórios' }]"
      show-example-badge
    >
      <template #actions>
        <select class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
          <option>Últimos 7 dias</option>
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
      <p v-if="toast" class="text-sm text-brand-indigo" role="status">{{ toast }}</p>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div
          v-for="card in [
            { label: 'Tempo médio de 1ª resposta', value: exampleReportKpis.avgFirstResponse, hint: 'Média dos últimos 7 dias (exemplo)', icon: null },
            { label: 'Conversas atendidas', value: String(exampleReportKpis.conversationsHandled), hint: exampleReportKpis.handledDelta, icon: TrendingUp },
            { label: 'Conversas resolvidas', value: String(exampleReportKpis.resolved), hint: `Taxa de resolução ${exampleReportKpis.resolutionRate} (exemplo)`, icon: CheckCircle2 },
            { label: 'Conversas em aberto', value: String(exampleReportKpis.open), hint: 'Fila atual e em atendimento (exemplo)', icon: Hourglass },
          ]"
          :key="card.label"
          class="relative rounded-xl border border-slate-200 bg-white p-4 shadow-xs"
        >
          <span class="absolute right-3 top-3 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-brand-gray">Exemplo</span>
          <p class="text-xs font-medium text-brand-gray">{{ card.label }}</p>
          <p class="mt-2 font-display text-2xl font-bold text-brand-ink">{{ card.value }}</p>
          <p class="mt-1 flex items-center gap-1 text-xs text-brand-gray">
            <component :is="card.icon" v-if="card.icon" class="h-3.5 w-3.5 text-emerald-600" />
            {{ card.hint }}
          </p>
        </div>
      </div>

      <section v-if="tab === 'agent'" class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div class="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 class="font-display text-base font-bold text-brand-ink">Desempenho por atendente</h2>
            <p class="text-xs text-brand-gray">
              Métricas de atendimento individual da equipe da clínica (dados de exemplo)
            </p>
          </div>
          <p class="text-xs text-brand-gray">
            {{ pluralizePt(exampleAgentPerformance.length, 'colaborador') }} listados
          </p>
        </div>
        <div class="mt-4 overflow-x-auto">
          <table class="w-full min-w-[800px] text-sm">
            <thead class="border-b border-slate-100 text-[11px] font-bold uppercase text-brand-gray">
              <tr>
                <th class="py-2 text-left">Colaborador</th>
                <th class="px-2 py-2 text-left">Setor</th>
                <th class="px-2 py-2 text-right">Atendidas</th>
                <th class="px-2 py-2 text-right">1ª Resposta</th>
                <th class="px-2 py-2 text-right">Tempo de resolução</th>
                <th class="px-2 py-2 text-right">Resolvidas</th>
                <th class="px-2 py-2 text-right">Em aberto</th>
                <th class="px-2 py-2 text-left">Eficiência</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="row in exampleAgentPerformance" :key="row.id">
                <td class="py-3">
                  <div class="flex items-center gap-2">
                    <span class="flex h-8 w-8 items-center justify-center rounded-full bg-brand-mist text-xs font-bold text-brand-indigo">
                      {{ initialsFromName(row.name) }}
                    </span>
                    <span class="font-medium text-brand-ink">
                      {{ row.name }}
                      <span v-if="row.isCurrentUser" class="text-xs text-brand-gray">(Você)</span>
                    </span>
                  </div>
                </td>
                <td class="px-2 py-3">
                  <span class="rounded-full border px-2 py-0.5 text-[11px] font-semibold" :class="sectorClass(row.sectorTone)">
                    {{ row.sector }}
                  </span>
                </td>
                <td class="px-2 py-3 text-right">{{ row.handled }}</td>
                <td class="px-2 py-3 text-right text-brand-gray">{{ row.firstResponse }}</td>
                <td class="px-2 py-3 text-right text-brand-gray">{{ row.resolutionTime }}</td>
                <td class="px-2 py-3 text-right font-medium text-emerald-700">{{ row.resolved }}</td>
                <td class="px-2 py-3 text-right">{{ row.open }}</td>
                <td class="px-2 py-3">
                  <div class="flex items-center gap-2">
                    <div class="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                      <div class="h-full rounded-full bg-brand-indigo" :style="{ width: `${row.efficiency}%` }" />
                    </div>
                    <span class="text-xs font-semibold text-brand-indigo">{{ row.efficiency }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section v-if="tab === 'campaign'" class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <h2 class="font-display text-base font-bold text-brand-ink">Desempenho por campanha</h2>
        <p class="text-xs text-brand-gray">Disparos automáticos e lembretes com templates oficiais (exemplo)</p>
        <table class="mt-4 w-full text-sm">
          <thead class="border-b border-slate-100 text-left text-[11px] font-bold uppercase text-brand-gray">
            <tr>
              <th class="py-2">Campanha</th>
              <th class="px-2 py-2 text-right">Enviadas</th>
              <th class="px-2 py-2 text-right">Entregues</th>
              <th class="px-2 py-2 text-right">Taxa de leitura</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="row in exampleCampaignPerformance" :key="row.name">
              <td class="py-2 font-medium text-brand-ink">{{ row.name }}</td>
              <td class="px-2 py-2 text-right">{{ row.sent }}</td>
              <td class="px-2 py-2 text-right">{{ row.delivered }}</td>
              <td class="px-2 py-2 text-right">{{ row.readRate }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <AppPageFooter />
    </div>

    <ExampleFiltersModal
      :open="filtersOpen"
      title="Filtros de relatórios"
      @close="filtersOpen = false"
      @apply="
        () => {
          filtersOpen = false
          showToast('Filtros aplicados (exemplo).')
        }
      "
    />
  </div>
</template>
