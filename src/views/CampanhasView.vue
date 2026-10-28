<script setup lang="ts">
import { GitBranch, Loader2, Plus, Search } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import { fetchCampaigns, sendCampaignNow } from '@/api/campaigns'
import { fetchMessageTemplates } from '@/api/messageTemplates'
import { fetchSequences } from '@/api/sequences'
import AppConfirmModal from '@/components/app/AppConfirmModal.vue'
import AppPageHeader from '@/components/app/AppPageHeader.vue'
import AppPageTabs from '@/components/app/AppPageTabs.vue'
import { panelBreadcrumbs } from '@/constants/panelBreadcrumbs'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import type { Campaign, CampaignStatus, MessageTemplate, Sequence } from '@/types/campaigns'
import { formatCampaignDeliverySummary } from '@/utils/campaignDeliveryCounts'
import { getErrorMessage } from '@/utils/errors'
import { pluralizePt } from '@/utils/pluralize'

const mainTab = ref<'campanhas' | 'sequencias' | 'modelos'>('campanhas')
const statusChip = ref<CampaignStatus | 'all'>('all')
const search = ref('')
const loading = ref(true)
const error = ref<string | null>(null)

const campaigns = ref<Campaign[]>([])
const sequences = ref<Sequence[]>([])
const templates = ref<MessageTemplate[]>([])
const sendingId = ref<number | null>(null)
const actionMessage = ref<string | null>(null)
const sendConfirmOpen = ref(false)
const campaignPendingSend = ref<Campaign | null>(null)

const sendConfirmMessage = computed(() => {
  if (!campaignPendingSend.value) return ''
  return `Enviar a campanha "${campaignPendingSend.value.name}" agora?`
})

const filteredCampaigns = computed(() => {
  let list = campaigns.value
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
  return campaigns.value.filter((c) => c.status === status).length
}

async function loadAll(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    const [c, s, t] = await Promise.all([fetchCampaigns(), fetchSequences(), fetchMessageTemplates()])
    campaigns.value = c
    sequences.value = s
    templates.value = t
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadAll()
})

function requestSendNow(campaign: Campaign): void {
  campaignPendingSend.value = campaign
  sendConfirmOpen.value = true
}

async function confirmSendNow(): Promise<void> {
  const campaign = campaignPendingSend.value
  if (!campaign) return
  sendingId.value = campaign.id
  actionMessage.value = null
  try {
    const result = await sendCampaignNow(campaign.id)
    actionMessage.value = result.queued
      ? `Campanha enfileirada para envio (status: ${result.status}).`
      : `Campanha atualizada (status: ${result.status}).`
    await loadAll()
    sendConfirmOpen.value = false
    campaignPendingSend.value = null
  } catch (err) {
    actionMessage.value = getErrorMessage(err)
  } finally {
    sendingId.value = null
  }
}

function canSendNow(campaign: Campaign): boolean {
  return campaign.status === 'rascunho' || campaign.status === 'agendada'
}

function canEditCampaign(campaign: Campaign): boolean {
  return campaign.status === 'rascunho' || campaign.status === 'agendada'
}
</script>

<template>
  <div class="flex min-h-full flex-col bg-brand-mist">
    <AppPageHeader
      title="Campanhas"
      :breadcrumbs="panelBreadcrumbs({ label: 'Campanhas' })"
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

    <p v-if="actionMessage" class="mx-4 mt-2 text-sm text-brand-indigo lg:mx-8" role="status">{{ actionMessage }}</p>

    <AppPageTabs>
      <button
        type="button"
        class="flex items-center gap-2 border-b-2 py-3 text-sm font-semibold"
        :class="mainTab === 'campanhas' ? 'border-brand-indigo text-brand-indigo' : 'border-transparent text-brand-gray'"
        @click="mainTab = 'campanhas'"
      >
        Campanhas
        <span class="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-bold">{{ campaigns.length }}</span>
      </button>
      <button
        type="button"
        class="flex items-center gap-2 border-b-2 py-3 text-sm font-medium"
        :class="mainTab === 'sequencias' ? 'border-brand-indigo text-brand-indigo' : 'border-transparent text-brand-gray'"
        @click="mainTab = 'sequencias'"
      >
        Sequências
        <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px]">{{ sequences.length }}</span>
      </button>
      <button
        type="button"
        class="flex items-center gap-2 border-b-2 py-3 text-sm font-medium"
        :class="mainTab === 'modelos' ? 'border-brand-indigo text-brand-indigo' : 'border-transparent text-brand-gray'"
        @click="mainTab = 'modelos'"
      >
        Modelos Meta
        <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px]">{{ templates.length }}</span>
      </button>
    </AppPageTabs>

    <div class="flex-1 px-4 py-6 sm:px-6 lg:px-8">
      <div v-if="loading" class="flex justify-center py-16">
        <Loader2 class="h-8 w-8 animate-spin text-brand-indigo" aria-label="Carregando" />
      </div>
      <div v-else-if="error" class="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p class="text-sm text-red-800">{{ error }}</p>
        <button type="button" class="mt-3 rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white" @click="loadAll">
          Tentar novamente
        </button>
      </div>

      <template v-else>
        <div v-if="mainTab === 'campanhas'" class="space-y-4">
          <div class="flex flex-wrap items-center gap-3">
            <div class="relative min-w-[200px] flex-1">
              <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray" />
              <input
                v-model="search"
                type="search"
                placeholder="Buscar campanha…"
                class="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm"
              />
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="chip in ['all', 'rascunho', 'agendada', 'enviando', 'concluida'] as const"
                :key="chip"
                type="button"
                class="rounded-full border px-3 py-1 text-xs font-semibold"
                :class="statusChip === chip ? 'border-brand-indigo bg-brand-mist text-brand-indigo' : 'border-slate-200 text-brand-gray'"
                @click="statusChip = chip"
              >
                {{ chip === 'all' ? 'Todas' : statusLabel(chip) }}
                <span v-if="chip !== 'all'">({{ countStatus(chip) }})</span>
              </button>
            </div>
          </div>
          <ul class="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-xs">
            <li v-for="campaign in filteredCampaigns" :key="campaign.id" class="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
              <div>
                <p class="font-semibold text-brand-ink">{{ campaign.name }}</p>
                <p class="text-xs text-brand-gray">
                  {{ campaign.template?.name ?? 'Sem template' }} ·
                  {{ formatCampaignDeliverySummary(campaign) }}
                </p>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <RouterLink
                  v-if="canEditCampaign(campaign)"
                  :to="{ name: 'campanhas-editar', params: { id: campaign.id } }"
                  class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-ink hover:bg-brand-mist"
                >
                  Editar
                </RouterLink>
                <button
                  v-if="canSendNow(campaign)"
                  type="button"
                  class="rounded-lg border border-brand-indigo bg-white px-3 py-1.5 text-xs font-semibold text-brand-indigo hover:bg-brand-mist disabled:opacity-60"
                  :disabled="sendingId === campaign.id"
                  @click="requestSendNow(campaign)"
                >
                  {{ sendingId === campaign.id ? 'Enviando…' : 'Enviar agora' }}
                </button>
                <span class="rounded-full border px-2 py-0.5 text-[11px] font-semibold" :class="statusClass(campaign.status)">
                  {{ statusLabel(campaign.status) }}
                </span>
              </div>
            </li>
            <li v-if="!filteredCampaigns.length" class="px-4 py-8 text-center text-sm text-brand-gray">
              Nenhuma campanha encontrada.
            </li>
          </ul>
        </div>

        <div v-if="mainTab === 'sequencias'" class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <p class="text-sm text-brand-gray">
            {{
              pluralizePt(sequences.length, 'sequência', {
                one: 'sequência cadastrada',
                other: 'sequências cadastradas',
              })
            }}.
          </p>
          <ul class="mt-4 divide-y divide-slate-100">
            <li v-for="seq in sequences" :key="seq.id" class="py-3">
              <RouterLink :to="{ name: 'campanhas-sequencia-detalhe', params: { id: seq.id } }" class="font-semibold text-brand-indigo hover:underline">
                {{ seq.name }}
              </RouterLink>
              <p class="text-xs text-brand-gray">{{ seq.contacts_in_progress }} em andamento</p>
            </li>
            <li v-if="!sequences.length" class="py-6 text-center text-sm text-brand-gray">Nenhuma sequência.</li>
          </ul>
        </div>

        <div v-if="mainTab === 'modelos'" class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <p class="text-xs text-brand-gray mb-3">
            Templates sincronizados do banco (provider fake até integração Meta real).
          </p>
          <ul class="divide-y divide-slate-100">
            <li v-for="template in templates" :key="template.id" class="py-3">
              <p class="font-medium text-brand-ink">{{ template.name }}</p>
              <p class="text-xs text-brand-gray">{{ template.category }} · {{ template.approved ? 'Aprovado' : 'Pendente' }}</p>
            </li>
            <li v-if="!templates.length" class="py-6 text-center text-sm text-brand-gray">Nenhum modelo.</li>
          </ul>
        </div>
      </template>

      <AppPageFooter />
    </div>

    <AppConfirmModal
      :open="sendConfirmOpen"
      title="Enviar campanha"
      :message="sendConfirmMessage"
      confirm-label="Enviar agora"
      variant="primary"
      :loading="sendingId != null"
      @close="sendConfirmOpen = false"
      @confirm="confirmSendNow"
    />
  </div>
</template>
