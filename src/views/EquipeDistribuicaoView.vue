<script setup lang="ts">
import {
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
} from '@lucide/vue'
import { computed, onMounted, ref, watch } from 'vue'

import {
  cancelTeamInvitation,
  downloadTeamAgentsCsv,
  fetchDistributionSettings,
  createSector,
  deleteSector,
  fetchPendingTeamInvitations,
  fetchSectors,
  fetchTeamAgents,
  inviteTeamMember,
  mapCreatedInvitationToPending,
  resendTeamInvitation,
  updateDistributionSettings,
  updateSector,
  updateTeamAgent,
} from '@/api/team'
import AppConfirmModal from '@/components/app/AppConfirmModal.vue'
import EditTeamMemberModal from '@/components/team/EditTeamMemberModal.vue'
import InviteTeamMemberModal from '@/components/team/InviteTeamMemberModal.vue'
import SectorFormModal from '@/components/team/SectorFormModal.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import AppPageShell from '@/components/layout/AppPageShell.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiInput from '@/components/ui/UiInput.vue'
import UiSubNav from '@/components/ui/UiSubNav.vue'
import UiTable from '@/components/ui/UiTable.vue'
import { initialsFromName } from '@/composables/useInitials'
import { panelBreadcrumbs } from '@/constants/panelBreadcrumbs'
import { useAuthStore } from '@/stores/auth'
import { useWhatsAppStore } from '@/stores/whatsapp'
import type { Sector, TeamAgent, TeamDistributionSettings, TeamPendingInvitation } from '@/types/team'
import { formatDateTimeBrazil } from '@/utils/datetime'
import { getErrorMessage, getValidationErrors } from '@/utils/errors'
import { pluralizePt } from '@/utils/pluralize'
import { formatAgentDisplayName, roleLabels } from '@/utils/teamLabels'

const PAGE_SIZE = 10

const auth = useAuthStore()
const whatsappStore = useWhatsAppStore()

type TeamSection = 'atendentes' | 'setores' | 'papeis' | 'regras'

const tab = ref<TeamSection>('atendentes')
const search = ref('')
const sectorFilter = ref<string>('all')
const presenceFilter = ref<'all' | 'online' | 'away' | 'offline'>('all')
const page = ref(1)

const loading = ref(true)
const error = ref<string | null>(null)
const statusMessage = ref<string | null>(null)

const agents = ref<TeamAgent[]>([])
const pendingInvitations = ref<TeamPendingInvitation[]>([])
const sectors = ref<Sector[]>([])
const settings = ref<TeamDistributionSettings | null>(null)
const settingsSaving = ref(false)

const inviteOpen = ref(false)

const editOpen = ref(false)
const editingAgent = ref<TeamAgent | null>(null)
const editSubmitting = ref(false)

const sectorModalOpen = ref(false)
const editingSector = ref<Sector | null>(null)
const sectorSaving = ref(false)

const sectorDeleteConfirmOpen = ref(false)
const sectorPendingDelete = ref<Sector | null>(null)
const sectorDeleteSubmitting = ref(false)

const invitationCancelConfirmOpen = ref(false)
const invitationPendingCancel = ref<TeamPendingInvitation | null>(null)
const invitationCancelSubmitting = ref(false)
const invitationResendId = ref<number | null>(null)

const agentToggleId = ref<number | null>(null)
const rowMenuAgentId = ref<number | null>(null)

const routingMethod = ref<TeamDistributionSettings['routing_method']>('round_robin')
const respectLimit = ref(true)
const overflowQueue = ref(true)
const chatLimitText = ref('8')
const chatLimitFieldError = ref<string | null>(null)
const defaultSectorId = ref<number | null>(null)

const headerBreadcrumbs = panelBreadcrumbs(
  { label: 'Gestão' },
  { label: 'Equipe e distribuição' },
)

const showWhatsappStatusColumn = computed(() => whatsappStore.connected)

const teamNavItems = computed(() => [
  { key: 'atendentes' as const, label: 'Atendentes', count: agents.value.length },
  { key: 'setores' as const, label: 'Setores', count: sectors.value.length },
  { key: 'papeis' as const, label: 'Papéis e permissões' },
  { key: 'regras' as const, label: 'Regras de distribuição' },
])

const permissionRows = [
  'Ver conversas',
  'Responder conversas',
  'Transferir entre atendentes',
  'Ver relatórios e métricas',
  'Gerenciar equipe e setores',
  'Gerenciar campanhas e disparos',
]

const permissionRoles = ['Administrador', 'Supervisor', 'Atendente'] as const

const permissionMatrix: Record<(typeof permissionRoles)[number], boolean[]> = {
  Administrador: [true, true, true, true, true, true],
  Supervisor: [true, true, true, true, false, false],
  Atendente: [true, true, false, false, false, false],
}

const sectorDeleteMessage = computed(() => {
  if (!sectorPendingDelete.value) return ''
  return `Excluir o setor "${sectorPendingDelete.value.name}"? Atendentes vinculados precisarão ser realocados.`
})

const invitationCancelMessage = computed(() => {
  if (!invitationPendingCancel.value) return ''
  const label = invitationDisplayName(invitationPendingCancel.value)
  return `Cancelar o convite para "${label}"? O link enviado por e-mail deixará de funcionar.`
})

const distributionSummary = computed(() => {
  const method = settings.value?.routing_method ?? routingMethod.value
  if (method === 'least_busy') {
    return 'As novas conversas sem atendente atribuído são distribuídas para quem tem menos conversas ativas no momento.'
  }
  if (method === 'manual') {
    return 'As novas conversas ficam na fila geral até um atendente assumir manualmente.'
  }
  return 'As novas conversas sem atendente atribuído são distribuídas no modelo Round-Robin (rotativo) entre atendentes online.'
})

function roleHasPermission(role: (typeof permissionRoles)[number], row: string): boolean {
  const index = permissionRows.indexOf(row)
  return permissionMatrix[role][index] === true
}

function sectorNameById(id: number | null): string {
  if (id == null) return '—'
  return sectors.value.find((s) => s.id === id)?.name ?? String(id)
}

function agentsInSector(sector: Sector): TeamAgent[] {
  if (sector.agents?.length) return sector.agents
  return agents.value.filter((agent) => agent.sector_id === sector.id)
}

function invitationDisplayName(invitation: TeamPendingInvitation): string {
  return invitation.name?.trim() || invitation.email
}

function invitationRoleLabel(role: TeamPendingInvitation['role']): string {
  if (!role) return '—'
  return roleLabels[role]
}

function roleBadgeVariant(role: TeamAgent['role']): 'neutral' | 'primary' | 'warning' {
  if (role === 'administrador') return 'primary'
  if (role === 'supervisor') return 'warning'
  return 'neutral'
}

function presenceLabel(agent: TeamAgent): string {
  if (agent.whatsapp_presence === 'online') return 'Online'
  if (agent.whatsapp_presence === 'away') return 'Ausente'
  return 'Offline'
}

function presenceDot(agent: TeamAgent): string {
  if (agent.whatsapp_presence === 'online') return 'bg-emerald-500'
  if (agent.whatsapp_presence === 'away') return 'bg-amber-500'
  return 'bg-slate-300'
}

function matchesPresence(agent: TeamAgent): boolean {
  if (presenceFilter.value === 'all') return true
  const presence = agent.whatsapp_presence ?? 'offline'
  if (presenceFilter.value === 'offline') {
    return presence !== 'online' && presence !== 'away'
  }
  return presence === presenceFilter.value
}

const AVATAR_PALETTE = [
  'bg-violet-100 text-violet-700',
  'bg-sky-100 text-sky-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-800',
  'bg-rose-100 text-rose-700',
] as const

function avatarColorClass(id: number): string {
  return AVATAR_PALETTE[Math.abs(id) % AVATAR_PALETTE.length] ?? AVATAR_PALETTE[0]
}

function isCurrentUser(agent: TeamAgent): boolean {
  const email = auth.user?.email?.toLowerCase()
  return Boolean(email && agent.email.toLowerCase() === email)
}

const filteredAgents = computed(() => {
  const q = search.value.trim().toLowerCase()
  return agents.value.filter((agent) => {
    if (sectorFilter.value !== 'all' && agent.sector_id !== Number(sectorFilter.value)) {
      return false
    }
    if (!matchesPresence(agent)) {
      return false
    }
    if (!q) return true
    return agent.name.toLowerCase().includes(q) || agent.email.toLowerCase().includes(q)
  })
})

const filteredPendingInvitations = computed(() => {
  const q = search.value.trim().toLowerCase()
  const list = pendingInvitations.value
  if (!q) return list
  return list.filter((invitation) => {
    const name = (invitation.name ?? '').toLowerCase()
    const email = invitation.email.toLowerCase()
    return name.includes(q) || email.includes(q)
  })
})

const totalFilteredAgents = computed(() => filteredAgents.value.length)

const totalPages = computed(() => Math.max(1, Math.ceil(totalFilteredAgents.value / PAGE_SIZE)))

const paginatedAgents = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return filteredAgents.value.slice(start, start + PAGE_SIZE)
})

const paginationFrom = computed(() => {
  if (!totalFilteredAgents.value) return 0
  return (page.value - 1) * PAGE_SIZE + 1
})

const paginationTo = computed(() => {
  if (!totalFilteredAgents.value) return 0
  return Math.min(page.value * PAGE_SIZE, totalFilteredAgents.value)
})

watch([search, sectorFilter, presenceFilter, tab], () => {
  page.value = 1
})

watch(totalPages, (pages) => {
  if (page.value > pages) {
    page.value = pages
  }
})

function openCreateSector(): void {
  editingSector.value = null
  sectorModalOpen.value = true
}

function openEditSector(sector: Sector): void {
  editingSector.value = sector
  sectorModalOpen.value = true
}

function openEditAgent(agent: TeamAgent): void {
  editingAgent.value = agent
  editOpen.value = true
  rowMenuAgentId.value = null
}

async function onSectorSave(payload: { name: string; description: string | null }): Promise<void> {
  sectorSaving.value = true
  statusMessage.value = null
  try {
    if (editingSector.value) {
      await updateSector(editingSector.value.id, payload)
      statusMessage.value = 'Setor atualizado.'
    } else {
      await createSector(payload)
      statusMessage.value = 'Setor criado.'
    }
    sectorModalOpen.value = false
    await loadAll()
  } catch (err) {
    statusMessage.value = getErrorMessage(err)
  } finally {
    sectorSaving.value = false
  }
}

function requestDeleteSector(sector: Sector): void {
  if (sector.is_default) {
    statusMessage.value = 'O setor padrão não pode ser excluído.'
    return
  }
  sectorPendingDelete.value = sector
  sectorDeleteConfirmOpen.value = true
}

async function confirmDeleteSector(): Promise<void> {
  if (!sectorPendingDelete.value) return
  sectorDeleteSubmitting.value = true
  try {
    await deleteSector(sectorPendingDelete.value.id)
    statusMessage.value = 'Setor removido.'
    sectorDeleteConfirmOpen.value = false
    sectorPendingDelete.value = null
    await loadAll()
  } catch (err) {
    statusMessage.value = getErrorMessage(err)
  } finally {
    sectorDeleteSubmitting.value = false
  }
}

function upsertPendingInvitation(invitation: TeamPendingInvitation): void {
  const list = pendingInvitations.value.filter((item) => item.id !== invitation.id)
  pendingInvitations.value = [invitation, ...list]
}

async function loadAll(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    const [agentList, sectorList, dist, invitations] = await Promise.all([
      fetchTeamAgents(),
      fetchSectors(),
      fetchDistributionSettings(),
      fetchPendingTeamInvitations(),
    ])
    agents.value = agentList
    pendingInvitations.value = invitations
    sectors.value = sectorList
    settings.value = dist
    routingMethod.value = dist.routing_method
    respectLimit.value = dist.respect_chat_limit
    overflowQueue.value = dist.overflow_to_sector_queue
    chatLimitText.value = String(dist.chat_limit)
    defaultSectorId.value = dist.default_sector_id
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!whatsappStore.hydrated) {
    void whatsappStore.refresh()
  }
  if (!auth.bootstrapped) {
    void auth.bootstrap()
  }
  void loadAll()
})

function parseChatLimit(): number | null {
  const trimmed = chatLimitText.value.trim()
  if (!/^\d+$/.test(trimmed)) {
    return null
  }
  const parsed = Number(trimmed)
  if (!Number.isInteger(parsed) || parsed < 1) {
    return null
  }
  return parsed
}

function validateChatLimitClient(): boolean {
  chatLimitFieldError.value = null
  if (!respectLimit.value) {
    return true
  }
  if (parseChatLimit() === null) {
    chatLimitFieldError.value = 'Informe um número inteiro maior ou igual a 1.'
    return false
  }
  return true
}

async function exportTeamCsv(): Promise<void> {
  try {
    const blob = await downloadTeamAgentsCsv()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'agents.csv'
    link.click()
    URL.revokeObjectURL(url)
    statusMessage.value = 'Lista exportada em CSV.'
  } catch (err) {
    statusMessage.value = getErrorMessage(err)
  }
}

async function onInvited(payload: {
  name: string
  email: string
  role: TeamAgent['role']
  sectorId: number | null
}): Promise<void> {
  try {
    const created = await inviteTeamMember({
      name: payload.name || null,
      email: payload.email,
      role: payload.role,
      sector_id: payload.sectorId,
    })
    upsertPendingInvitation(mapCreatedInvitationToPending(created))
    statusMessage.value = `Convite enviado para ${payload.email}. O link foi disparado por e-mail.`
    await loadAll()
  } catch (err) {
    const validation = getValidationErrors(err)
    statusMessage.value = validation?.email ?? getErrorMessage(err)
  }
}

async function onEditAgentSave(payload: {
  role: TeamAgent['role']
  sectorId: number | null
  phone: string | null
  receivesChats: boolean
}): Promise<void> {
  if (!editingAgent.value) return
  editSubmitting.value = true
  statusMessage.value = null
  try {
    await updateTeamAgent(editingAgent.value.id, {
      role: payload.role,
      sector_id: payload.sectorId,
      phone: payload.phone,
      receives_chats: payload.receivesChats,
    })
    statusMessage.value = 'Colaborador atualizado.'
    editOpen.value = false
    editingAgent.value = null
    await loadAll()
  } catch (err) {
    statusMessage.value = getErrorMessage(err)
  } finally {
    editSubmitting.value = false
  }
}

async function toggleReceivesChats(agent: TeamAgent): Promise<void> {
  agentToggleId.value = agent.id
  statusMessage.value = null
  try {
    await updateTeamAgent(agent.id, { receives_chats: !agent.receives_chats })
    agent.receives_chats = !agent.receives_chats
    statusMessage.value = 'Preferência de recebimento atualizada.'
  } catch (err) {
    statusMessage.value = getErrorMessage(err)
  } finally {
    agentToggleId.value = null
  }
}

function requestCancelInvitation(invitation: TeamPendingInvitation): void {
  invitationPendingCancel.value = invitation
  invitationCancelConfirmOpen.value = true
}

async function confirmCancelInvitation(): Promise<void> {
  if (!invitationPendingCancel.value) return
  invitationCancelSubmitting.value = true
  try {
    await cancelTeamInvitation(invitationPendingCancel.value.id)
    pendingInvitations.value = pendingInvitations.value.filter(
      (item) => item.id !== invitationPendingCancel.value?.id,
    )
    statusMessage.value = 'Convite cancelado.'
    invitationCancelConfirmOpen.value = false
    invitationPendingCancel.value = null
  } catch (err) {
    statusMessage.value = getErrorMessage(err)
  } finally {
    invitationCancelSubmitting.value = false
  }
}

async function onResendInvitation(invitation: TeamPendingInvitation): Promise<void> {
  invitationResendId.value = invitation.id
  statusMessage.value = null
  try {
    const created = await resendTeamInvitation(invitation.id)
    upsertPendingInvitation(mapCreatedInvitationToPending(created))
    statusMessage.value = `Convite reenviado para ${invitation.email}.`
  } catch (err) {
    statusMessage.value = getErrorMessage(err)
  } finally {
    invitationResendId.value = null
  }
}

async function saveDistribution(): Promise<void> {
  if (!validateChatLimitClient()) {
    return
  }

  const chatLimit = parseChatLimit() ?? 1

  settingsSaving.value = true
  statusMessage.value = null
  chatLimitFieldError.value = null
  try {
    settings.value = await updateDistributionSettings({
      routing_method: routingMethod.value,
      respect_chat_limit: respectLimit.value,
      chat_limit: chatLimit,
      overflow_to_sector_queue: overflowQueue.value,
      default_sector_id: defaultSectorId.value,
    })
    chatLimitText.value = String(settings.value.chat_limit)
    statusMessage.value = 'Regras de distribuição salvas.'
  } catch (err) {
    const validation = getValidationErrors(err)
    if (validation?.chat_limit) {
      chatLimitFieldError.value = validation.chat_limit
    } else {
      statusMessage.value = getErrorMessage(err)
    }
  } finally {
    settingsSaving.value = false
  }
}

function goToPreviousPage(): void {
  page.value = Math.max(1, page.value - 1)
}

function goToNextPage(): void {
  page.value = Math.min(totalPages.value, page.value + 1)
}

function toggleRowMenu(agentId: number): void {
  rowMenuAgentId.value = rowMenuAgentId.value === agentId ? null : agentId
}
</script>

<template>
  <AppPageShell title="Equipe e distribuição" :breadcrumbs="headerBreadcrumbs">
    <template #actions>
      <UiButton variant="secondary" @click="exportTeamCsv">
        <Upload class="h-4 w-4 text-brand-gray" aria-hidden="true" />
        Exportar lista
      </UiButton>
      <UiButton @click="inviteOpen = true">
        <Plus class="h-4 w-4" aria-hidden="true" />
        Convidar atendente
      </UiButton>
    </template>

    <div class="flex min-h-0 flex-1 flex-col lg:flex-row">
      <UiSubNav
        section-label="Equipe"
        :items="teamNavItems"
        :active="tab"
        @select="tab = $event"
      />

      <div class="flex min-w-0 flex-1 flex-col">
        <div class="flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          <p v-if="statusMessage" class="text-sm text-brand-indigo" role="status">{{ statusMessage }}</p>

          <div v-if="loading" class="flex justify-center py-16" aria-busy="true" aria-label="Carregando equipe">
            <Loader2 class="h-8 w-8 animate-spin text-brand-indigo" />
          </div>

          <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p class="text-sm text-red-800">{{ error }}</p>
            <UiButton class="mt-3" @click="loadAll">Tentar novamente</UiButton>
          </div>

          <template v-else>
            <section v-if="tab === 'atendentes'" class="space-y-6">
              <UiCard padding="none" class="overflow-hidden">
                <div class="space-y-4 border-b border-slate-100 px-4 py-4 sm:px-5">
                  <UiInput
                    v-model="search"
                    type="search"
                    placeholder="Filtrar por nome ou e-mail..."
                    aria-label="Filtrar por nome ou e-mail"
                    class="w-full"
                  >
                    <template #leading>
                      <Search class="h-4 w-4" aria-hidden="true" />
                    </template>
                  </UiInput>
                  <div class="flex flex-wrap gap-3">
                    <label class="flex min-w-[160px] flex-1 items-center gap-2 text-sm text-brand-gray sm:max-w-xs">
                      <span class="sr-only">Filtrar por setor</span>
                      <Filter class="h-4 w-4 shrink-0" aria-hidden="true" />
                      <select
                        id="team-sector-filter"
                        v-model="sectorFilter"
                        aria-label="Filtrar por setor"
                        class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-brand-ink"
                      >
                        <option value="all">Todos os setores</option>
                        <option v-for="sector in sectors" :key="sector.id" :value="sector.id">
                          {{ sector.name }}
                        </option>
                      </select>
                    </label>
                    <label class="flex min-w-[140px] flex-1 items-center gap-2 text-sm sm:max-w-[200px]">
                      <span class="sr-only">Status</span>
                      <select
                        v-model="presenceFilter"
                        class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-brand-ink"
                      >
                        <option value="all">Status</option>
                        <option value="online">Online</option>
                        <option value="away">Ausente</option>
                        <option value="offline">Offline</option>
                      </select>
                    </label>
                  </div>
                </div>

                <ul v-if="filteredPendingInvitations.length" class="divide-y divide-amber-100">
                  <li
                    v-for="invitation in filteredPendingInvitations"
                    :key="invitation.id"
                    class="flex flex-col gap-3 bg-amber-50/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                  >
                    <div class="min-w-0">
                      <div class="flex flex-wrap items-center gap-2">
                        <span class="font-semibold text-brand-ink">{{ invitationDisplayName(invitation) }}</span>
                        <UiBadge variant="warning" size="sm">Convite pendente</UiBadge>
                      </div>
                      <p class="mt-1 text-xs text-brand-gray">
                        Papel: {{ invitationRoleLabel(invitation.role) }} · Setor:
                        {{ sectorNameById(invitation.sector_id) }}
                        <template v-if="invitation.expires_at">
                          · Válido até {{ formatDateTimeBrazil(invitation.expires_at) }} (horário de Brasília)
                        </template>
                      </p>
                      <p v-if="invitation.email !== invitationDisplayName(invitation)" class="text-xs text-brand-gray">
                        {{ invitation.email }}
                      </p>
                    </div>
                    <div class="flex shrink-0 flex-wrap items-center gap-3 text-sm font-semibold">
                      <button
                        type="button"
                        class="text-brand-indigo hover:underline disabled:opacity-50"
                        :disabled="invitationResendId === invitation.id"
                        @click="onResendInvitation(invitation)"
                      >
                        {{ invitationResendId === invitation.id ? 'Reenviando…' : 'Reenviar convite' }}
                      </button>
                      <button
                        type="button"
                        class="text-brand-gray hover:text-brand-ink hover:underline"
                        @click="requestCancelInvitation(invitation)"
                      >
                        Cancelar
                      </button>
                    </div>
                  </li>
                </ul>

                <UiTable class="rounded-none border-0">
                  <thead>
                    <tr>
                      <th scope="col">Colaborador</th>
                      <th scope="col">Setor</th>
                      <th scope="col">Papel</th>
                      <th v-if="showWhatsappStatusColumn" scope="col">Status WhatsApp</th>
                      <th scope="col">Recebe conversas</th>
                      <th scope="col" class="text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="agent in paginatedAgents" :key="agent.id">
                      <td>
                        <div class="flex items-center gap-3">
                          <span
                            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                            :class="avatarColorClass(agent.id)"
                          >
                            {{ initialsFromName(agent.name) }}
                          </span>
                          <div class="min-w-0">
                            <p class="font-semibold text-brand-ink">
                              {{ formatAgentDisplayName(agent, agents) }}
                              <span v-if="isCurrentUser(agent)" class="text-xs font-normal text-brand-gray">(Você)</span>
                            </p>
                            <p class="truncate text-xs text-brand-gray">
                              {{ agent.phone || '—' }} · {{ agent.email }}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>{{ sectorNameById(agent.sector_id) }}</td>
                      <td>
                        <UiBadge :variant="roleBadgeVariant(agent.role)" size="md">
                          {{ roleLabels[agent.role] }}
                        </UiBadge>
                      </td>
                      <td v-if="showWhatsappStatusColumn">
                        <span class="inline-flex items-center gap-1.5 text-xs">
                          <span class="h-2 w-2 rounded-full" :class="presenceDot(agent)" aria-hidden="true" />
                          {{ presenceLabel(agent) }}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          role="switch"
                          class="relative inline-flex h-6 w-11 shrink-0 rounded-full border border-transparent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-indigo disabled:opacity-50"
                          :class="agent.receives_chats ? 'bg-brand-indigo' : 'bg-slate-200'"
                          :aria-checked="agent.receives_chats"
                          :aria-label="`Recebe conversas: ${agent.receives_chats ? 'sim' : 'não'}`"
                          :disabled="agentToggleId === agent.id"
                          @click="toggleReceivesChats(agent)"
                        >
                          <span
                            class="pointer-events-none inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow-sm transition-transform"
                            :class="agent.receives_chats ? 'translate-x-5' : 'translate-x-0.5'"
                          />
                        </button>
                      </td>
                      <td class="text-right">
                        <div class="relative inline-flex items-center justify-end gap-1">
                          <button
                            type="button"
                            class="rounded-lg p-2 text-brand-gray hover:bg-slate-100 hover:text-brand-indigo"
                            aria-label="Editar colaborador"
                            @click="openEditAgent(agent)"
                          >
                            <Pencil class="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            class="rounded-lg p-2 text-brand-gray hover:bg-slate-100 hover:text-brand-indigo"
                            aria-label="Mais ações"
                            @click="toggleRowMenu(agent.id)"
                          >
                            <MoreVertical class="h-4 w-4" />
                          </button>
                          <div
                            v-if="rowMenuAgentId === agent.id"
                            class="absolute right-0 top-full z-10 mt-1 min-w-[10rem] rounded-lg border border-slate-200 bg-white py-1 text-left text-sm shadow-lg"
                          >
                            <button
                              type="button"
                              class="block w-full px-3 py-2 text-left hover:bg-slate-50"
                              @click="openEditAgent(agent)"
                            >
                              Alterar papel e setor
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr v-if="!paginatedAgents.length">
                      <td :colspan="showWhatsappStatusColumn ? 6 : 5" class="py-10 text-center text-brand-gray">
                        Nenhum atendente encontrado.
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
                    <span class="font-medium text-brand-ink">{{ totalFilteredAgents }}</span>
                    {{
                      pluralizePt(totalFilteredAgents, 'atendente ativo', {
                        one: 'atendente ativo',
                        other: 'atendentes ativos',
                      })
                    }}
                  </p>
                  <div class="flex items-center gap-1">
                    <UiButton
                      variant="secondary"
                      size="sm"
                      :disabled="page <= 1 || !totalFilteredAgents"
                      aria-label="Página anterior"
                      @click="goToPreviousPage"
                    >
                      <ChevronLeft class="h-4 w-4" />
                    </UiButton>
                    <UiButton
                      variant="secondary"
                      size="sm"
                      :disabled="page >= totalPages || !totalFilteredAgents"
                      aria-label="Próxima página"
                      @click="goToNextPage"
                    >
                      <ChevronRight class="h-4 w-4" />
                    </UiButton>
                  </div>
                </div>
              </UiCard>

              <UiCard padding="lg" class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div class="flex min-w-0 items-start gap-3">
                  <span
                    class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-mist text-brand-indigo"
                    aria-hidden="true"
                  >
                    <ArrowRightLeft class="h-5 w-5" />
                  </span>
                  <div>
                    <h2 class="text-base font-semibold text-brand-ink">Distribuição automática de conversas</h2>
                    <p class="mt-1 text-sm text-brand-gray">{{ distributionSummary }}</p>
                  </div>
                </div>
                <UiButton variant="secondary" class="shrink-0" @click="tab = 'regras'">Ajustar regra</UiButton>
              </UiCard>
            </section>

            <UiCard v-else-if="tab === 'setores'" padding="md">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 class="font-display text-lg font-bold text-brand-ink">Setores de atendimento</h2>
                  <p class="text-xs text-brand-gray">Organize a equipe e a fila por setor.</p>
                </div>
                <UiButton size="sm" @click="openCreateSector">
                  <Plus class="h-4 w-4" />
                  Novo setor
                </UiButton>
              </div>
              <ul class="mt-4 space-y-3">
                <li
                  v-for="sector in sectors"
                  :key="sector.id"
                  class="rounded-lg border border-slate-100 p-4"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <p class="text-sm font-semibold text-brand-ink">
                        {{ sector.name }}
                        <span v-if="sector.is_default" class="text-xs font-normal text-brand-gray">(Padrão)</span>
                      </p>
                      <p class="mt-1 text-xs text-brand-gray">{{ sector.description || 'Sem descrição' }}</p>
                    </div>
                    <div class="flex shrink-0 gap-1">
                      <button
                        type="button"
                        class="rounded-lg p-2 text-brand-gray hover:bg-slate-100 hover:text-brand-indigo"
                        aria-label="Editar setor"
                        @click="openEditSector(sector)"
                      >
                        <Pencil class="h-4 w-4" />
                      </button>
                      <button
                        v-if="!sector.is_default"
                        type="button"
                        class="rounded-lg p-2 text-brand-gray hover:bg-red-50 hover:text-red-600"
                        aria-label="Excluir setor"
                        @click="requestDeleteSector(sector)"
                      >
                        <Trash2 class="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div class="mt-3 border-t border-slate-100 pt-3">
                    <p class="text-[11px] font-bold uppercase tracking-wide text-brand-gray">Atendentes</p>
                    <ul v-if="agentsInSector(sector).length" class="mt-2 space-y-1 text-sm text-brand-ink">
                      <li v-for="agent in agentsInSector(sector)" :key="agent.id">
                        {{ formatAgentDisplayName(agent, agents) }}
                        <span class="text-xs text-brand-gray">· {{ roleLabels[agent.role] }}</span>
                      </li>
                    </ul>
                    <p v-else class="mt-2 text-xs text-brand-gray">Nenhum atendente neste setor.</p>
                  </div>
                </li>
                <li v-if="!sectors.length" class="py-6 text-center text-sm text-brand-gray">Nenhum setor cadastrado.</li>
              </ul>
            </UiCard>

            <UiCard v-else-if="tab === 'papeis'" padding="md">
              <h2 class="font-display text-lg font-bold text-brand-ink">Papéis e permissões</h2>
              <p class="mt-1 text-xs text-brand-gray">Visão geral das permissões por papel no painel.</p>
              <div class="mt-4 overflow-x-auto">
                <UiTable>
                  <thead>
                    <tr>
                      <th scope="col">Permissão</th>
                      <th v-for="role in permissionRoles" :key="role" scope="col">{{ role }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in permissionRows" :key="row">
                      <td>{{ row }}</td>
                      <td v-for="role in permissionRoles" :key="role" class="text-center">
                        <span v-if="roleHasPermission(role, row)">✓</span>
                        <span v-else class="text-brand-gray">—</span>
                      </td>
                    </tr>
                  </tbody>
                </UiTable>
              </div>
            </UiCard>

            <UiCard v-else-if="tab === 'regras'" padding="lg">
              <h2 class="font-display text-base font-bold text-brand-ink">Regras de distribuição de conversas</h2>
              <div class="mt-4 grid gap-3 md:grid-cols-3">
                <button
                  v-for="opt in [
                    { key: 'round_robin', title: 'Rodízio', desc: 'Distribuição sequencial entre atendentes.' },
                    { key: 'least_busy', title: 'Menor carga', desc: 'Prioriza quem tem menos conversas ativas.' },
                    { key: 'manual', title: 'Atribuição manual', desc: 'Conversas ficam na fila geral.' },
                  ]"
                  :key="opt.key"
                  type="button"
                  class="rounded-lg border p-4 text-left transition-colors"
                  :class="
                    routingMethod === opt.key
                      ? 'border-brand-indigo bg-brand-mist'
                      : 'border-slate-200 hover:border-slate-300'
                  "
                  @click="routingMethod = opt.key as typeof routingMethod"
                >
                  <p class="text-sm font-semibold text-brand-ink">{{ opt.title }}</p>
                  <p class="mt-1 text-xs text-brand-gray">{{ opt.desc }}</p>
                </button>
              </div>
              <div class="mt-6 space-y-4 border-t border-slate-100 pt-4">
                <label class="flex items-center justify-between gap-4">
                  <span class="text-sm text-brand-ink">Respeitar limite de conversas simultâneas</span>
                  <input v-model="respectLimit" type="checkbox" class="h-4 w-4 rounded text-brand-indigo" />
                </label>
                <div v-if="respectLimit" class="text-sm">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="text-brand-gray">Limite:</span>
                    <label for="chat-limit" class="sr-only">Limite de conversas simultâneas</label>
                    <input
                      id="chat-limit"
                      v-model="chatLimitText"
                      type="text"
                      inputmode="numeric"
                      pattern="[0-9]*"
                      class="w-20 rounded border px-2 py-1"
                      :class="chatLimitFieldError ? 'border-red-300 bg-red-50' : 'border-slate-200'"
                      aria-describedby="chat-limit-error"
                      @input="chatLimitFieldError = null"
                    />
                    <span class="text-brand-gray">chats</span>
                  </div>
                  <p v-if="chatLimitFieldError" id="chat-limit-error" class="mt-1 text-xs text-red-600" role="alert">
                    {{ chatLimitFieldError }}
                  </p>
                </div>
                <label class="flex items-center justify-between gap-4">
                  <span class="text-sm text-brand-ink">Enviar para fila do setor quando ninguém estiver online</span>
                  <input v-model="overflowQueue" type="checkbox" class="h-4 w-4 rounded text-brand-indigo" />
                </label>
                <div>
                  <label for="default-sector-id" class="mb-1 block text-xs font-semibold uppercase text-brand-gray"
                    >Setor padrão</label
                  >
                  <select
                    id="default-sector-id"
                    v-model="defaultSectorId"
                    class="w-full max-w-md rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    <option :value="null">Nenhum</option>
                    <option v-for="sector in sectors" :key="sector.id" :value="sector.id">
                      {{ sector.name }}{{ sector.is_default ? ' (Padrão)' : '' }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="mt-6 flex justify-end">
                <UiButton :disabled="settingsSaving" @click="saveDistribution">
                  {{ settingsSaving ? 'Salvando…' : 'Salvar regras' }}
                </UiButton>
              </div>
            </UiCard>
          </template>

          <AppPageFooter />
        </div>
      </div>
    </div>

    <InviteTeamMemberModal
      :open="inviteOpen"
      :sectors="sectors"
      @close="inviteOpen = false"
      @invited="onInvited"
    />

    <EditTeamMemberModal
      :open="editOpen"
      :agent="editingAgent"
      :sectors="sectors"
      :submitting="editSubmitting"
      @close="editOpen = false"
      @save="onEditAgentSave"
    />

    <SectorFormModal
      :open="sectorModalOpen"
      :sector="editingSector"
      :submitting="sectorSaving"
      @close="sectorModalOpen = false"
      @save="onSectorSave"
    />

    <AppConfirmModal
      :open="sectorDeleteConfirmOpen"
      title="Excluir setor"
      :message="sectorDeleteMessage"
      confirm-label="Excluir"
      :loading="sectorDeleteSubmitting"
      @close="sectorDeleteConfirmOpen = false"
      @confirm="confirmDeleteSector"
    />

    <AppConfirmModal
      :open="invitationCancelConfirmOpen"
      title="Cancelar convite"
      :message="invitationCancelMessage"
      confirm-label="Cancelar convite"
      :loading="invitationCancelSubmitting"
      @close="invitationCancelConfirmOpen = false"
      @confirm="confirmCancelInvitation"
    />
  </AppPageShell>
</template>
