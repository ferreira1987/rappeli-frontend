<script setup lang="ts">
import { Download, Loader2, Pencil, Plus, Trash2, UserPlus } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'

import {
  downloadTeamAgentsCsv,
  fetchDistributionSettings,
  createSector,
  deleteSector,
  fetchSectors,
  fetchTeamAgents,
  inviteTeamMember,
  updateDistributionSettings,
  updateSector,
} from '@/api/team'
import InviteTeamMemberModal from '@/components/team/InviteTeamMemberModal.vue'
import SectorFormModal from '@/components/team/SectorFormModal.vue'
import AppPageHeader from '@/components/app/AppPageHeader.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import { initialsFromName } from '@/composables/useInitials'
import type { Sector, TeamAgent, TeamDistributionSettings } from '@/types/team'
import { getErrorMessage, getValidationErrors } from '@/utils/errors'
import { pluralizePt } from '@/utils/pluralize'
import { formatAgentDisplayName, roleLabels } from '@/utils/teamLabels'

const tab = ref<'atendentes' | 'setores' | 'papeis' | 'regras'>('atendentes')
const search = ref('')
const loading = ref(true)
const error = ref<string | null>(null)
const statusMessage = ref<string | null>(null)

const agents = ref<TeamAgent[]>([])
const sectors = ref<Sector[]>([])
const settings = ref<TeamDistributionSettings | null>(null)
const settingsSaving = ref(false)

const inviteOpen = ref(false)

const sectorModalOpen = ref(false)
const editingSector = ref<Sector | null>(null)
const sectorSaving = ref(false)

const routingMethod = ref<TeamDistributionSettings['routing_method']>('round_robin')
const respectLimit = ref(true)
const overflowQueue = ref(true)
const chatLimit = ref(8)
const defaultSectorId = ref<number | null>(null)

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

function openCreateSector(): void {
  editingSector.value = null
  sectorModalOpen.value = true
}

function openEditSector(sector: Sector): void {
  editingSector.value = sector
  sectorModalOpen.value = true
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

async function onDeleteSector(sector: Sector): Promise<void> {
  if (sector.is_default) {
    statusMessage.value = 'O setor padrão não pode ser excluído.'
    return
  }
  if (!window.confirm(`Excluir o setor "${sector.name}"? Atendentes vinculados precisarão ser realocados.`)) {
    return
  }
  try {
    await deleteSector(sector.id)
    statusMessage.value = 'Setor removido.'
    await loadAll()
  } catch (err) {
    statusMessage.value = getErrorMessage(err)
  }
}

const filteredAgents = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return agents.value
  return agents.value.filter(
    (a) => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q),
  )
})

function roleBadgeClass(role: TeamAgent['role']): string {
  const map = {
    atendente: 'bg-violet-50 text-violet-700 border-violet-200',
    supervisor: 'bg-orange-50 text-orange-700 border-orange-200',
    administrador: 'bg-blue-50 text-blue-700 border-blue-200',
  }
  return map[role]
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

async function loadAll(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    const [agentList, sectorList, dist] = await Promise.all([
      fetchTeamAgents(),
      fetchSectors(),
      fetchDistributionSettings(),
    ])
    agents.value = agentList
    sectors.value = sectorList
    settings.value = dist
    routingMethod.value = dist.routing_method
    respectLimit.value = dist.respect_chat_limit
    overflowQueue.value = dist.overflow_to_sector_queue
    chatLimit.value = dist.chat_limit
    defaultSectorId.value = dist.default_sector_id
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadAll()
})

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
    await inviteTeamMember({
      name: payload.name || null,
      email: payload.email,
      role: payload.role,
      sector_id: payload.sectorId,
    })
    statusMessage.value =
      `Convite registrado para ${payload.email}. Envio automático de e-mail: Em breve.`
    await loadAll()
  } catch (err) {
    const validation = getValidationErrors(err)
    statusMessage.value = validation?.email ?? getErrorMessage(err)
  }
}

async function saveDistribution(): Promise<void> {
  settingsSaving.value = true
  statusMessage.value = null
  try {
    settings.value = await updateDistributionSettings({
      routing_method: routingMethod.value,
      respect_chat_limit: respectLimit.value,
      chat_limit: chatLimit.value,
      overflow_to_sector_queue: overflowQueue.value,
      default_sector_id: defaultSectorId.value,
    })
    statusMessage.value = 'Regras de distribuição salvas.'
  } catch (err) {
    statusMessage.value = getErrorMessage(err)
  } finally {
    settingsSaving.value = false
  }
}
</script>

<template>
  <div class="flex min-h-full flex-col bg-brand-mist">
    <AppPageHeader
      title="Equipe e distribuição"
      :breadcrumbs="[{ label: 'Painel', to: '/painel' }, { label: 'Equipe e distribuição' }]"
    >
      <template #actions>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
          @click="exportTeamCsv"
        >
          <Download class="h-4 w-4" />
          Exportar lista
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white hover:bg-brand-indigo-hover"
          @click="inviteOpen = true"
        >
          <UserPlus class="h-4 w-4" />
          Convidar atendente
        </button>
      </template>
    </AppPageHeader>

    <div class="border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
      <div class="flex flex-wrap gap-6">
        <button
          v-for="item in [
            { key: 'atendentes', label: `Atendentes (${agents.length})` },
            { key: 'setores', label: `Setores (${sectors.length})` },
            { key: 'papeis', label: 'Papéis e permissões' },
            { key: 'regras', label: 'Regras de distribuição' },
          ]"
          :key="item.key"
          type="button"
          class="border-b-2 py-3 text-sm font-semibold transition"
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
      <p v-if="statusMessage" class="text-sm text-brand-indigo" role="status">{{ statusMessage }}</p>

      <div v-if="loading" class="flex justify-center py-16">
        <Loader2 class="h-8 w-8 animate-spin text-brand-indigo" aria-label="Carregando equipe" />
      </div>

      <div v-else-if="error" class="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p class="text-sm text-red-800">{{ error }}</p>
        <button type="button" class="mt-3 rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white" @click="loadAll">
          Tentar novamente
        </button>
      </div>

      <template v-else>
        <section v-if="tab === 'atendentes'" class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <h2 class="font-display text-base font-bold text-brand-ink">Atendentes da clínica</h2>
          <div class="mt-4 flex flex-wrap gap-3">
            <input
              v-model="search"
              type="search"
              placeholder="Filtrar por nome ou e-mail…"
              class="min-w-[220px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div class="mt-4 overflow-x-auto">
            <table class="w-full min-w-[720px] text-left text-sm">
              <thead class="text-[11px] font-bold uppercase text-brand-gray">
                <tr class="border-b border-slate-100">
                  <th class="py-2 pr-4">Colaborador</th>
                  <th class="px-4 py-2">Setor</th>
                  <th class="px-4 py-2">Papel</th>
                  <th class="px-4 py-2">Status WhatsApp</th>
                  <th class="px-4 py-2">Recebe conversas</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="agent in filteredAgents" :key="agent.id">
                  <td class="py-3 pr-4">
                    <div class="flex items-center gap-3">
                      <span class="flex h-9 w-9 items-center justify-center rounded-full bg-brand-mist text-xs font-bold text-brand-indigo">
                        {{ initialsFromName(agent.name) }}
                      </span>
                      <div>
                        <p class="font-semibold text-brand-ink">{{ formatAgentDisplayName(agent, agents) }}</p>
                        <p class="text-xs text-brand-gray">{{ agent.phone || '—' }} · {{ agent.email }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-brand-ink">{{ sectorNameById(agent.sector_id) }}</td>
                  <td class="px-4 py-3">
                    <span class="rounded-full border px-2 py-0.5 text-[11px] font-semibold" :class="roleBadgeClass(agent.role)">
                      {{ roleLabels[agent.role] }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <span class="inline-flex items-center gap-1.5 text-xs">
                      <span class="h-2 w-2 rounded-full" :class="presenceDot(agent)" />
                      {{ presenceLabel(agent) }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <input type="checkbox" :checked="agent.receives_chats" disabled class="h-4 w-4 rounded text-brand-indigo" />
                  </td>
                </tr>
                <tr v-if="!filteredAgents.length">
                  <td colspan="5" class="py-6 text-center text-brand-gray">Nenhum atendente encontrado.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="mt-3 text-xs text-brand-gray">
            {{ pluralizePt(filteredAgents.length, 'atendente') }} exibidos. Edição inline: Em breve.
          </p>
        </section>

        <section v-if="tab === 'setores'" class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 class="font-display font-bold text-brand-ink">Setores de atendimento</h2>
              <p class="text-xs text-brand-gray">Organize a equipe e a fila por setor.</p>
            </div>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg bg-brand-indigo px-3 py-2 text-sm font-semibold text-white"
              @click="openCreateSector"
            >
              <Plus class="h-4 w-4" />
              Novo setor
            </button>
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
                    @click="onDeleteSector(sector)"
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
        </section>

        <section v-if="tab === 'papeis'" class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <h2 class="font-display font-bold text-brand-ink">Papéis e permissões</h2>
          <p class="mt-1 text-xs text-brand-gray">Matriz estática — permissões granulares via API: Em breve.</p>
          <div class="mt-4 overflow-x-auto">
            <table class="w-full min-w-[640px] text-sm">
              <thead>
                <tr class="border-b border-slate-100 text-left text-[11px] font-bold uppercase text-brand-gray">
                  <th class="py-2 pr-4">Permissão</th>
                  <th v-for="role in permissionRoles" :key="role" class="px-4 py-2">{{ role }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="row in permissionRows" :key="row">
                  <td class="py-2 pr-4 text-brand-ink">{{ row }}</td>
                  <td v-for="role in permissionRoles" :key="role" class="px-4 py-2 text-center">
                    <span v-if="roleHasPermission(role, row)">✓</span>
                    <span v-else class="text-brand-gray">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section v-if="tab === 'regras'" class="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
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
              class="rounded-xl border p-4 text-left transition"
              :class="
                routingMethod === opt.key
                  ? 'border-brand-indigo bg-brand-mist/50 ring-1 ring-brand-indigo/30'
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
            <div v-if="respectLimit" class="flex items-center gap-2 text-sm">
              <span class="text-brand-gray">Limite:</span>
              <input v-model.number="chatLimit" type="number" class="w-20 rounded border border-slate-200 px-2 py-1" />
              <span class="text-brand-gray">chats</span>
            </div>
            <label class="flex items-center justify-between gap-4">
              <span class="text-sm text-brand-ink">Enviar para fila do setor quando ninguém estiver online</span>
              <input v-model="overflowQueue" type="checkbox" class="h-4 w-4 rounded text-brand-indigo" />
            </label>
            <div>
              <label class="mb-1 block text-xs font-semibold uppercase text-brand-gray">Setor padrão</label>
              <select v-model="defaultSectorId" class="w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option :value="null">Nenhum</option>
                <option v-for="sector in sectors" :key="sector.id" :value="sector.id">
                  {{ sector.name }}{{ sector.is_default ? ' (Padrão)' : '' }}
                </option>
              </select>
            </div>
          </div>
          <div class="mt-6 flex justify-end">
            <button
              type="button"
              class="rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              :disabled="settingsSaving"
              @click="saveDistribution"
            >
              {{ settingsSaving ? 'Salvando…' : 'Salvar regras' }}
            </button>
          </div>
        </section>
      </template>

      <AppPageFooter />
    </div>

    <InviteTeamMemberModal
      :open="inviteOpen"
      :sectors="sectors"
      @close="inviteOpen = false"
      @invited="onInvited"
    />

    <SectorFormModal
      :open="sectorModalOpen"
      :sector="editingSector"
      :submitting="sectorSaving"
      @close="sectorModalOpen = false"
      @save="onSectorSave"
    />
  </div>
</template>
