<script setup lang="ts">
import { GitBranch, Loader2, Plus, Search } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import { fetchCampaigns, deleteCampaign, sendCampaignNow } from '@/api/campaigns'
import { fetchMessageTemplatesList } from '@/api/messageTemplates'
import { fetchSequences } from '@/api/sequences'
import AppConfirmModal from '@/components/app/AppConfirmModal.vue'
import MessageTemplatesPanel from '@/components/message-templates/MessageTemplatesPanel.vue'
import AppPageHeader from '@/components/app/AppPageHeader.vue'
import AppPageTabs from '@/components/app/AppPageTabs.vue'
import UiFilterChip from '@/components/ui/UiFilterChip.vue'
import { panelBreadcrumbs } from '@/constants/panelBreadcrumbs'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import type { Campaign, CampaignStatus, Sequence } from '@/types/campaigns'
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
const templatesCount = ref(0)
const sendingId = ref<number | null>(null)
const actionMessage = ref<string | null>(null)
const sendConfirmOpen = ref(false)
const campaignPendingSend = ref<Campaign | null>(null)
const deleteConfirmOpen = ref(false)
const campaignPendingDelete = ref<Campaign | null>(null)
const deleteSubmitting = ref(false)

const deleteConfirmMessage = computed(() => {
  if (!campaignPendingDelete.value) return ''
  return `Excluir a campanha "${campaignPendingDelete.value.name}"? Esta ação não pode ser desfeita.`
})

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
    const [c, s] = await Promise.all([fetchCampaigns(), fetchSequences()])
    campaigns.value = c
    sequences.value = s
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}

async function loadTemplatesCount(): Promise<void> {
  try {
    const result = await fetchMessageTemplatesList()
    templatesCount.value = result.templates.length
  } catch {
    // Contador da aba Modelos é informativo; falha silenciosa.
  }
}

onMounted(() => {
  void loadAll()
  void loadTemplatesCount()
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

function canDeleteCampaign(campaign: Campaign): boolean {
  return campaign.status === 'rascunho' || campaign.status === 'agendada'
}

function requestDeleteCampaign(campaign: Campaign): void {
  campaignPendingDelete.value = campaign
  deleteConfirmOpen.value = true
}

async function confirmDeleteCampaign(): Promise<void> {
  const campaign = campaignPendingDelete.value
  if (!campaign) return
  deleteSubmitting.value = true
  actionMessage.value = null
  try {
    await deleteCampaign(campaign.id)
    actionMessage.value = 'Campanha excluída.'
    deleteConfirmOpen.value = false
    campaignPendingDelete.value = null
    await loadAll()
  } catch (err) {
    actionMessage.value = getErrorMessage(err)
  } finally {
    deleteSubmitting.value = false
  }
}
</script>

<template>
  <div class="flex min-h-full flex-col bg-brand-surface">
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
      <UiFilterChip :active="mainTab === 'campanhas'" @click="mainTab = 'campanhas'">
        Campanhas
        <span class="rounded-full px-1.5 text-[10px] font-bold" :class="mainTab === 'campanhas' ? 'bg-white/20' : 'bg-brand-mist text-brand-indigo'">{{ campaigns.length }}</span>
      </UiFilterChip>
      <UiFilterChip :active="mainTab === 'sequencias'" @click="mainTab = 'sequencias'">
        Sequências
        <span class="rounded-full px-1.5 text-[10px] font-bold" :class="mainTab === 'sequencias' ? 'bg-white/20' : 'bg-slate-100 text-brand-gray'">{{ sequences.length }}</span>
      </UiFilterChip>
      <UiFilterChip :active="mainTab === 'modelos'" @click="mainTab = 'modelos'">
        Modelos de mensagem
        <span class="rounded-full px-1.5 text-[10px] font-bold" :class="mainTab === 'modelos' ? 'bg-white/20' : 'bg-slate-100 text-brand-gray'">{{ templatesCount }}</span>
      </UiFilterChip>
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
                <button
                  v-if="canDeleteCampaign(campaign)"
                  type="button"
                  class="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                  :disabled="deleteSubmitting"
                  @click="requestDeleteCampaign(campaign)"
                >
                  Excluir
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

        <MessageTemplatesPanel
          v-if="mainTab === 'modelos'"
          @update:count="templatesCount = $event"
        />
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
    <AppConfirmModal
      :open="deleteConfirmOpen"
      title="Excluir campanha"
      :message="deleteConfirmMessage"
      confirm-label="Excluir"
      variant="danger"
      :loading="deleteSubmitting"
      @close="deleteConfirmOpen = false"
      @confirm="confirmDeleteCampaign"
    />
  </div>
</template>
