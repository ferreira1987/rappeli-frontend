<script setup lang="ts">
import { GitBranch, Info, Plus, Search } from '@lucide/vue'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

import AppPageHeader from '@/components/app/AppPageHeader.vue'
import AppPageTabs from '@/components/app/AppPageTabs.vue'
import { panelBreadcrumbs } from '@/constants/panelBreadcrumbs'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import type { CampaignStatus } from '@/mocks/campaigns'
import { exampleCampaigns, exampleSequences } from '@/services/example'

const mainTab = ref<'campanhas' | 'sequencias' | 'modelos'>('campanhas')
const statusChip = ref<CampaignStatus | 'all'>('all')
const search = ref('')

const filteredCampaigns = computed(() => {
  let list = exampleCampaigns
  if (statusChip.value !== 'all') {
    list = list.filter((c) => c.status === statusChip.value)
  }
  const q = search.value.trim().toLowerCase()
  if (q) {
    list = list.filter((c) => c.name.toLowerCase().includes(q))
  }
  return list
})

function statusLabel(status: CampaignStatus): string {
  const map: Record<CampaignStatus, string> = {
    enviando: 'Enviando',
    agendada: 'Agendada',
    concluida: 'Concluída',
    rascunho: 'Rascunho',
  }
  return map[status]
}

function statusClass(status: CampaignStatus): string {
  const map: Record<CampaignStatus, string> = {
    enviando: 'bg-orange-50 text-orange-700 border-orange-200',
    agendada: 'bg-blue-50 text-blue-700 border-blue-200',
    concluida: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rascunho: 'bg-slate-50 text-slate-600 border-slate-200',
  }
  return map[status]
}

function countStatus(status: CampaignStatus): number {
  return exampleCampaigns.filter((c) => c.status === status).length
}
</script>

<template>
  <div class="flex min-h-full flex-col bg-brand-mist">
    <AppPageHeader
      title="Campanhas"
      :breadcrumbs="panelBreadcrumbs({ label: 'Campanhas' })"
      show-example-badge
    >
      <template #actions>
        <RouterLink
          :to="{ name: 'campanhas-sequencias' }"
          class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-brand-ink hover:bg-slate-50"
        >
          <GitBranch class="h-4 w-4 text-brand-gray" />
          Sequências
        </RouterLink>
        <RouterLink
          :to="{ name: 'campanhas-nova' }"
          class="inline-flex items-center gap-2 rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white hover:bg-brand-indigo-hover"
        >
          <Plus class="h-4 w-4" />
          Nova campanha
        </RouterLink>
      </template>
    </AppPageHeader>

    <AppPageTabs>
        <button
          type="button"
          class="flex items-center gap-2 border-b-2 py-3 text-sm font-semibold"
          :class="mainTab === 'campanhas' ? 'border-brand-indigo text-brand-indigo' : 'border-transparent text-brand-gray'"
          @click="mainTab = 'campanhas'"
        >
          Campanhas
          <span class="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-bold">{{ exampleCampaigns.length }}</span>
        </button>
        <button
          type="button"
          class="flex items-center gap-2 border-b-2 py-3 text-sm font-medium text-brand-gray"
          @click="mainTab = 'sequencias'"
        >
          Sequências
          <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px]">{{ exampleSequences.length }}</span>
        </button>
        <button type="button" class="border-b-2 border-transparent py-3 text-sm font-medium text-brand-gray">
          Modelos de mensagem
        </button>
    </AppPageTabs>

    <div class="flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div class="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <Info class="h-5 w-5 shrink-0 text-blue-600" />
        <p>
          Campanhas usam templates de mensagem aprovados pela Meta e só podem ser enviadas a contatos que deram
          consentimento (opt-in) para receber mensagens. Respeite as regras e políticas do WhatsApp Business.
          <a href="#" class="font-semibold hover:underline" @click.prevent>Saiba mais →</a>
        </p>
      </div>

      <template v-if="mainTab === 'campanhas'">
        <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div class="flex flex-wrap items-center gap-3">
            <div class="relative min-w-[200px] flex-1">
              <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray" />
              <input
                v-model="search"
                type="search"
                placeholder="Filtrar por nome de campanha…"
                class="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs"
              />
            </div>
            <div class="flex flex-wrap gap-1.5">
              <button
                type="button"
                class="rounded-full border px-2.5 py-1 text-xs font-medium"
                :class="statusChip === 'enviando' ? 'border-indigo-200 bg-indigo-50 text-brand-indigo' : 'border-slate-200 text-brand-gray'"
                @click="statusChip = statusChip === 'enviando' ? 'all' : 'enviando'"
              >
                Ativas ({{ countStatus('enviando') }})
              </button>
              <button
                type="button"
                class="rounded-full border px-2.5 py-1 text-xs font-medium"
                :class="statusChip === 'agendada' ? 'border-indigo-200 bg-indigo-50 text-brand-indigo' : 'border-slate-200 text-brand-gray'"
                @click="statusChip = statusChip === 'agendada' ? 'all' : 'agendada'"
              >
                Agendadas ({{ countStatus('agendada') }})
              </button>
              <button
                type="button"
                class="rounded-full border px-2.5 py-1 text-xs font-medium"
                :class="statusChip === 'concluida' ? 'border-indigo-200 bg-indigo-50 text-brand-indigo' : 'border-slate-200 text-brand-gray'"
                @click="statusChip = statusChip === 'concluida' ? 'all' : 'concluida'"
              >
                Concluídas ({{ countStatus('concluida') }})
              </button>
            </div>
            <span class="text-xs text-brand-gray">Exibindo <strong>{{ filteredCampaigns.length }}</strong> campanhas</span>
          </div>
        </div>

        <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <table class="w-full min-w-[900px] text-left text-xs">
            <thead class="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase text-brand-gray">
              <tr>
                <th class="px-4 py-3">Nome da campanha</th>
                <th class="px-4 py-3">Segmento</th>
                <th class="px-4 py-3">Template Meta</th>
                <th class="px-4 py-3">Agendamento</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3 text-center">Enviadas</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="campaign in filteredCampaigns" :key="campaign.id" class="hover:bg-slate-50/80">
                <td class="px-4 py-3">
                  <p class="font-semibold text-brand-ink">{{ campaign.name }}</p>
                  <p class="text-[11px] text-brand-gray">{{ campaign.description }}</p>
                </td>
                <td class="px-4 py-3">
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="tag in campaign.segmentTags"
                      :key="tag"
                      class="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <p class="font-medium text-brand-ink">{{ campaign.templateName }}</p>
                  <span
                    v-if="campaign.templateApproved"
                    class="mt-0.5 inline-block rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700"
                  >
                    Aprovado
                  </span>
                </td>
                <td class="px-4 py-3 text-brand-gray">{{ campaign.scheduleLabel }}</td>
                <td class="px-4 py-3">
                  <span class="rounded-full border px-2 py-0.5 text-[10px] font-semibold" :class="statusClass(campaign.status)">
                    {{ statusLabel(campaign.status) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center font-medium">{{ campaign.sent }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <section v-if="mainTab === 'sequencias' || mainTab === 'campanhas'" class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 class="font-display text-base font-bold text-brand-ink">Sequências ativas</h2>
            <p class="text-xs text-brand-gray">Disparos automáticos multi-etapas baseados em gatilhos e tempo</p>
          </div>
          <RouterLink
            :to="{ name: 'campanhas-sequencias' }"
            class="inline-flex items-center gap-1 rounded-lg bg-brand-indigo px-3 py-2 text-sm font-semibold text-white"
          >
            <Plus class="h-4 w-4" /> Nova sequência
          </RouterLink>
        </div>
        <div class="mt-4 grid gap-4 md:grid-cols-2">
          <article
            v-for="seq in exampleSequences"
            :key="seq.id"
            class="rounded-xl border border-slate-200 p-4"
          >
            <div class="flex items-start justify-between gap-2">
              <h3 class="font-semibold text-sm text-brand-ink">{{ seq.name }}</h3>
              <span class="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Em execução</span>
            </div>
            <p class="mt-2 text-xs text-brand-gray">{{ seq.description }}</p>
            <p class="mt-3 text-xs text-brand-gray">
              {{ seq.steps }} etapas · {{ seq.contactsInProgress }} contatos em andamento
            </p>
            <p class="mt-1 text-xs font-medium text-brand-indigo">✓ Somente contatos com opt-in</p>
          </article>
        </div>
      </section>

      <AppPageFooter />
    </div>
  </div>
</template>
