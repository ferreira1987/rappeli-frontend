<script setup lang="ts">
import { GitBranch, Loader2, Megaphone, Plus, Search } from '@lucide/vue'
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { fetchCampaigns, deleteCampaign, sendCampaignNow } from '@/api/campaigns'
import AppConfirmModal from '@/components/app/AppConfirmModal.vue'
import MessageTemplatesPanel from '@/components/message-templates/MessageTemplatesPanel.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import AppPageShell from '@/components/layout/AppPageShell.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiFilterChip from '@/components/ui/UiFilterChip.vue'
import UiInput from '@/components/ui/UiInput.vue'
import UiTable from '@/components/ui/UiTable.vue'
import { panelBreadcrumbs } from '@/constants/panelBreadcrumbs'
import type { Campaign, CampaignStatus } from '@/types/campaigns'
import {
  formatCampaignDeliverySummary,
  formatCampaignListEnvioLine,
} from '@/utils/campaignDeliveryCounts'
import { getErrorMessage } from '@/utils/errors'
import { pluralWordPt } from '@/utils/pluralize'

const PAGE_SIZE = 10

const route = useRoute()
const router = useRouter()

const statusChip = ref<CampaignStatus | 'all'>('all')
const search = ref('')
const page = ref(1)
const loading = ref(true)
const error = ref<string | null>(null)

const campaigns = ref<Campaign[]>([])
const sendingId = ref<number | null>(null)
const actionMessage = ref<string | null>(null)
const sendConfirmOpen = ref(false)
const campaignPendingSend = ref<Campaign | null>(null)
const deleteConfirmOpen = ref(false)
const campaignPendingDelete = ref<Campaign | null>(null)
const deleteSubmitting = ref(false)

const showModelosPanel = computed(() => route.query.secao === 'modelos')

const headerBreadcrumbs = panelBreadcrumbs({ label: 'Automação' }, { label: 'Campanhas' })

const statusFilterOptions = [
  { id: 'all' as const, label: 'Todas' },
  { id: 'rascunho' as const, label: 'Rascunho' },
  { id: 'agendada' as const, label: 'Agendada' },
  { id: 'enviando' as const, label: 'Enviando' },
  { id: 'concluida' as const, label: 'Concluída' },
]

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

const totalFiltered = computed(() => filteredCampaigns.value.length)

const totalPages = computed(() => Math.max(1, Math.ceil(totalFiltered.value / PAGE_SIZE)))

const paginatedCampaigns = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return filteredCampaigns.value.slice(start, start + PAGE_SIZE)
})

const paginationFrom = computed(() => {
  if (!totalFiltered.value) return 0
  return (page.value - 1) * PAGE_SIZE + 1
})

const paginationTo = computed(() => {
  if (!totalFiltered.value) return 0
  return Math.min(page.value * PAGE_SIZE, totalFiltered.value)
})

const paginationWord = computed(() => pluralWordPt(totalFiltered.value, 'campanha'))

watch([statusChip, search], () => {
  page.value = 1
})

watch(totalPages, (pages) => {
  if (page.value > pages) {
    page.value = pages
  }
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

function statusBadgeVariant(status: CampaignStatus): 'neutral' | 'primary' | 'success' | 'warning' {
  const map: Record<CampaignStatus, 'neutral' | 'primary' | 'success' | 'warning'> = {
    enviando: 'warning',
    agendada: 'primary',
    concluida: 'success',
    rascunho: 'neutral',
  }
  return map[status]
}

function templateModelLabel(campaign: Campaign): string {
  const name = campaign.template?.name?.trim()
  return name ? `Modelo ${name}` : 'Sem template'
}

function countStatus(status: CampaignStatus): number {
  return campaigns.value.filter((c) => c.status === status).length
}

function showsDeliverySummary(status: CampaignStatus): boolean {
  return status === 'enviando' || status === 'concluida'
}

async function loadCampaigns(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    campaigns.value = await fetchCampaigns()
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadCampaigns()
})

function openModelosPanel(): void {
  void router.push({ name: 'campanhas', query: { secao: 'modelos' } })
}

function closeModelosPanel(): void {
  void router.push({ name: 'campanhas' })
}

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
    await loadCampaigns()
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

function canViewDetails(campaign: Campaign): boolean {
  return campaign.status === 'concluida'
}

function canViewProgress(campaign: Campaign): boolean {
  return campaign.status === 'enviando'
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
    await loadCampaigns()
  } catch (err) {
    actionMessage.value = getErrorMessage(err)
  } finally {
    deleteSubmitting.value = false
  }
}

function goToPreviousPage(): void {
  page.value = Math.max(1, page.value - 1)
}

function goToNextPage(): void {
  page.value = Math.min(totalPages.value, page.value + 1)
}
</script>

<template>
  <AppPageShell
    title="Campanhas"
    subtitle="Crie e gerencie disparos de mensagens em massa para seus contatos."
    :breadcrumbs="headerBreadcrumbs"
  >
    <template #actions>
      <RouterLink :to="{ name: 'campanhas-sequencias' }" class="inline-flex">
        <UiButton variant="secondary">
          <GitBranch class="h-4 w-4 text-brand-gray" aria-hidden="true" />
          Sequências
        </UiButton>
      </RouterLink>
      <RouterLink :to="{ name: 'campanhas-nova' }" class="inline-flex">
        <UiButton>
          <Plus class="h-4 w-4" aria-hidden="true" />
          Nova campanha
        </UiButton>
      </RouterLink>
    </template>

    <div class="flex min-h-0 flex-1 flex-col space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <p v-if="actionMessage" class="text-sm text-brand-indigo" role="status">{{ actionMessage }}</p>

      <div v-if="loading" class="flex justify-center py-16">
        <Loader2 class="h-8 w-8 animate-spin text-brand-indigo" aria-label="Carregando campanhas" />
      </div>

      <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p class="text-sm text-red-800">{{ error }}</p>
        <UiButton class="mt-3" @click="loadCampaigns">Tentar novamente</UiButton>
      </div>

      <template v-else-if="showModelosPanel">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-base font-semibold text-brand-ink">Modelos de mensagem</h2>
          <UiButton variant="secondary" size="sm" @click="closeModelosPanel">Voltar para campanhas</UiButton>
        </div>
        <MessageTemplatesPanel />
      </template>

      <template v-else>
        <UiCard padding="none" class="overflow-hidden">
          <div class="space-y-4 border-b border-slate-100 px-4 py-4 sm:px-5">
            <UiInput
              v-model="search"
              type="search"
              placeholder="Buscar campanha..."
              aria-label="Buscar campanha"
              class="min-w-0 w-full"
              input-class="w-full"
            >
              <template #leading>
                <Search class="h-4 w-4" aria-hidden="true" />
              </template>
            </UiInput>

            <div class="flex flex-wrap gap-2" role="group" aria-label="Filtrar campanhas por status">
              <UiFilterChip
                v-for="option in statusFilterOptions"
                :key="option.id"
                :active="statusChip === option.id"
                @click="statusChip = option.id"
              >
                {{ option.label }}
                <span
                  v-if="option.id !== 'all'"
                  class="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold leading-none tabular-nums"
                  :class="
                    statusChip === option.id
                      ? 'bg-white/20 text-white'
                      : 'bg-brand-mist text-brand-indigo'
                  "
                  :aria-label="`${countStatus(option.id)} campanhas`"
                >
                  {{ countStatus(option.id) }}
                </span>
              </UiFilterChip>
            </div>

            <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold">
              <RouterLink :to="{ name: 'campanhas-sequencias' }" class="text-brand-indigo hover:underline">
                Ver sequências
              </RouterLink>
              <button type="button" class="text-brand-indigo hover:underline" @click="openModelosPanel">
                Modelos de mensagem
              </button>
            </div>
          </div>

          <UiTable class="rounded-none border-0">
            <thead>
              <tr>
                <th scope="col">Campanha</th>
                <th scope="col">Modelo / envio</th>
                <th scope="col">Status</th>
                <th scope="col" class="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="campaign in paginatedCampaigns" :key="campaign.id">
                <td>
                  <div class="flex items-center gap-3">
                    <span
                      class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-mist text-brand-indigo"
                      aria-hidden="true"
                    >
                      <Megaphone class="h-4 w-4" />
                    </span>
                    <span class="font-semibold text-brand-ink">{{ campaign.name }}</span>
                  </div>
                </td>
                <td class="text-sm text-brand-gray">
                  <div class="space-y-1.5">
                    <p>
                      <span class="text-brand-ink">{{ templateModelLabel(campaign) }}</span>
                      <span aria-hidden="true"> · </span>
                      <span>{{ formatCampaignListEnvioLine(campaign) }}</span>
                    </p>
                    <p
                      v-if="showsDeliverySummary(campaign.status)"
                      class="text-xs leading-snug text-brand-gray"
                    >
                      {{ formatCampaignDeliverySummary(campaign) }}
                    </p>
                  </div>
                </td>
                <td>
                  <UiBadge :variant="statusBadgeVariant(campaign.status)" size="md">
                    <span
                      v-if="campaign.status === 'enviando'"
                      class="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-500"
                      aria-hidden="true"
                    />
                    {{ statusLabel(campaign.status) }}
                  </UiBadge>
                </td>
                <td class="text-right">
                  <div class="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-sm font-semibold">
                    <RouterLink
                      v-if="canViewDetails(campaign)"
                      :to="{ name: 'campanhas-editar', params: { id: campaign.id } }"
                      class="text-brand-indigo hover:underline"
                    >
                      Ver detalhes
                    </RouterLink>
                    <RouterLink
                      v-if="canViewProgress(campaign)"
                      :to="{ name: 'campanhas-editar', params: { id: campaign.id } }"
                      class="text-brand-indigo hover:underline"
                    >
                      Ver progresso
                    </RouterLink>
                    <RouterLink
                      v-if="canEditCampaign(campaign)"
                      :to="{ name: 'campanhas-editar', params: { id: campaign.id } }"
                      class="text-brand-indigo hover:underline"
                    >
                      Editar
                    </RouterLink>
                    <button
                      v-if="canSendNow(campaign)"
                      type="button"
                      class="text-brand-indigo hover:underline disabled:opacity-60"
                      :disabled="sendingId === campaign.id"
                      @click="requestSendNow(campaign)"
                    >
                      {{ sendingId === campaign.id ? 'Enviando…' : 'Enviar agora' }}
                    </button>
                    <button
                      v-if="canDeleteCampaign(campaign)"
                      type="button"
                      class="text-red-600 hover:underline disabled:opacity-60"
                      :disabled="deleteSubmitting"
                      @click="requestDeleteCampaign(campaign)"
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!paginatedCampaigns.length">
                <td colspan="4" class="py-10 text-center text-sm text-brand-gray">
                  Nenhuma campanha encontrada.
                </td>
              </tr>
            </tbody>
          </UiTable>

          <div
            class="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
          >
            <p class="text-sm text-brand-gray">
              Exibindo
              <span class="font-medium text-brand-ink">{{ paginationFrom }}</span>
              –
              <span class="font-medium text-brand-ink">{{ paginationTo }}</span>
              de
              <span class="font-medium text-brand-ink">{{ totalFiltered }}</span>
              {{ paginationWord }}
            </p>
            <div class="flex items-center gap-2">
              <UiButton
                variant="secondary"
                size="sm"
                :disabled="page <= 1 || !totalFiltered"
                @click="goToPreviousPage"
              >
                Anterior
              </UiButton>
              <UiButton
                variant="secondary"
                size="sm"
                :disabled="page >= totalPages || !totalFiltered"
                @click="goToNextPage"
              >
                Próxima
              </UiButton>
            </div>
          </div>
        </UiCard>
      </template>

      <AppPageFooter class="mt-auto" />
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
  </AppPageShell>
</template>
