<script setup lang="ts">
import { Download, Pencil, Plus, Trash2, UserPlus } from '@lucide/vue'
import { computed, ref } from 'vue'

import InviteTeamMemberModal from '@/components/team/InviteTeamMemberModal.vue'
import AppPageHeader from '@/components/app/AppPageHeader.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import { useExampleToast } from '@/composables/useExampleToast'
import { initialsFromName } from '@/composables/useInitials'
import { downloadCsv } from '@/utils/exportCsv'
import { pluralizePt } from '@/utils/pluralize'
import type { ExampleAgent } from '@/mocks/team'
import {
  exampleAgents,
  exampleSectors,
  roleLabels,
  sectorNameById,
} from '@/services/example'

const tab = ref<'atendentes' | 'setores' | 'papeis' | 'regras'>('atendentes')
const search = ref('')
const routingMethod = ref<'round_robin' | 'sector' | 'manual'>('round_robin')
const respectLimit = ref(true)
const overflowQueue = ref(true)
const chatLimit = ref(8)
const { message: toast, show: showToast } = useExampleToast()
const inviteOpen = ref(false)

function exportTeamCsv(): void {
  downloadCsv(
    'equipe-atendentes-exemplo.csv',
    ['Nome', 'E-mail', 'Setor', 'Papel', 'Conversas ativas'],
    filteredAgents.value.map((agent) => [
      agent.name,
      agent.email,
      sectorNameById(agent.sectorId),
      roleLabels[agent.role],
      String(agent.activeChats),
    ]),
  )
  showToast('Lista exportada em CSV (exemplo).')
}

const filteredAgents = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return exampleAgents
  return exampleAgents.filter(
    (a) => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q),
  )
})

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

function statusDot(agent: ExampleAgent): string {
  if (agent.whatsappStatus === 'online') return 'bg-emerald-500'
  if (agent.whatsappStatus === 'ausente') return 'bg-amber-500'
  return 'bg-slate-300'
}

function statusLabel(agent: ExampleAgent): string {
  if (agent.whatsappStatus === 'online') return 'Online'
  if (agent.whatsappStatus === 'ausente') return 'Ausente'
  return 'Offline'
}

function roleBadgeClass(role: ExampleAgent['role']): string {
  const map = {
    atendente: 'bg-violet-50 text-violet-700 border-violet-200',
    supervisor: 'bg-orange-50 text-orange-700 border-orange-200',
    administrador: 'bg-blue-50 text-blue-700 border-blue-200',
  }
  return map[role]
}
</script>

<template>
  <div class="flex min-h-full flex-col bg-brand-mist">
    <AppPageHeader
      title="Equipe e distribuição"
      :breadcrumbs="[{ label: 'Painel', to: '/painel' }, { label: 'Equipe e distribuição' }]"
      show-example-badge
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
            { key: 'atendentes', label: `Atendentes (${exampleAgents.length})` },
            { key: 'setores', label: `Setores (${exampleSectors.length})` },
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
      <p v-if="toast" class="text-sm text-brand-indigo" role="status">{{ toast }}</p>
      <section v-if="tab === 'atendentes'" class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <h2 class="font-display text-base font-bold text-brand-ink">Atendentes da clínica</h2>
        <div class="mt-4 flex flex-wrap gap-3">
          <input
            v-model="search"
            type="search"
            placeholder="Filtrar por nome ou e-mail…"
            class="min-w-[220px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <select class="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option>Todos os setores</option>
          </select>
        </div>
        <div class="mt-4 overflow-x-auto">
          <table class="w-full min-w-[720px] text-left text-sm">
            <thead class="text-[11px] font-bold uppercase text-brand-gray">
              <tr class="border-b border-slate-100">
                <th class="py-2 pr-4">Colaborador</th>
                <th class="px-4 py-2">Setor</th>
                <th class="px-4 py-2">Papel</th>
                <th class="px-4 py-2">Status WhatsApp</th>
                <th class="px-4 py-2">Conversas ativas</th>
                <th class="px-4 py-2">Recebe conversas</th>
                <th class="py-2 pl-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="agent in filteredAgents" :key="agent.id">
                <td class="py-3 pr-4">
                  <div class="flex items-center gap-3">
                    <span
                      class="flex h-9 w-9 items-center justify-center rounded-full bg-brand-mist text-xs font-bold text-brand-indigo"
                    >
                      {{ initialsFromName(agent.name) }}
                    </span>
                    <div>
                      <p class="font-semibold text-brand-ink">
                        {{ agent.name }}
                        <span v-if="agent.isCurrentUser" class="text-xs font-normal text-brand-gray">(Você)</span>
                      </p>
                      <p class="text-xs text-brand-gray">{{ agent.phone }} · {{ agent.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3 text-brand-ink">{{ sectorNameById(agent.sectorId) }}</td>
                <td class="px-4 py-3">
                  <span
                    class="rounded-full border px-2 py-0.5 text-[11px] font-semibold"
                    :class="roleBadgeClass(agent.role)"
                  >
                    {{ roleLabels[agent.role] }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span class="inline-flex items-center gap-1.5 text-xs">
                    <span class="h-2 w-2 rounded-full" :class="statusDot(agent)" />
                    {{ statusLabel(agent) }}
                  </span>
                </td>
                <td class="px-4 py-3 font-medium">{{ agent.activeChats }}</td>
                <td class="px-4 py-3">
                  <input type="checkbox" :checked="agent.receivesChats" class="h-4 w-4 rounded text-brand-indigo" />
                </td>
                <td class="py-3 pl-4 text-right">
                  <button
                    type="button"
                    class="p-1 text-brand-gray hover:text-brand-indigo"
                    aria-label="Editar atendente"
                    title="Editar atendente"
                    @click="showToast('Edição de atendente (exemplo).')"
                  >
                    <Pencil class="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    class="p-1 text-brand-gray hover:text-red-600"
                    aria-label="Remover atendente"
                    title="Remover atendente"
                    @click="showToast('Remoção simulada (exemplo).')"
                  >
                    <Trash2 class="h-4 w-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="mt-3 text-xs text-brand-gray">
          Exibindo {{ pluralizePt(filteredAgents.length, 'atendente') }} · 3 online, 1 ausente, 1 offline (exemplo)
        </p>
      </section>

      <section v-if="tab === 'setores'" class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div class="flex items-center justify-between">
            <h2 class="font-display font-bold text-brand-ink">Setores de atendimento</h2>
            <button type="button" class="inline-flex items-center gap-1 text-sm font-semibold text-brand-indigo">
              <Plus class="h-4 w-4" /> Novo setor
            </button>
          </div>
          <ul class="mt-4 space-y-3">
            <li
              v-for="sector in exampleSectors"
              :key="sector.id"
              class="flex items-start justify-between rounded-lg border border-slate-100 p-3"
            >
              <div>
                <p class="font-semibold text-sm text-brand-ink">
                  {{ sector.name }}
                </p>
                <p class="mt-1 text-xs text-brand-gray">{{ sector.description }}</p>
                <p class="mt-1 text-[11px] text-brand-gray">
                  {{ pluralizePt(sector.memberCount, 'membro') }}
                </p>
              </div>
              <button type="button" class="text-brand-gray hover:text-brand-indigo"><Pencil class="h-4 w-4" /></button>
            </li>
          </ul>
      </section>

      <section v-if="tab === 'papeis'" class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <h2 class="font-display font-bold text-brand-ink">Papéis e permissões</h2>
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
        <div class="flex items-center gap-2">
          <h2 class="font-display text-base font-bold text-brand-ink">Regras de distribuição de conversas</h2>
          <span class="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            Distribuição ativa
          </span>
        </div>
        <p class="mt-1 text-sm text-brand-gray">Método principal de roteamento</p>
        <div class="mt-4 grid gap-3 md:grid-cols-3">
          <button
            v-for="opt in [
              { key: 'round_robin', title: 'Rodízio entre atendentes online', desc: 'Distribuição sequencial entre quem está online.' },
              { key: 'sector', title: 'Por setor', desc: 'Paciente escolhe via menu ou fluxo.' },
              { key: 'manual', title: 'Atribuição manual', desc: 'Conversas vão para caixa geral.' },
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
            <label class="mb-1 block text-xs font-semibold uppercase text-brand-gray">Setor padrão para novos contatos</label>
            <select class="w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option>Recepção (Padrão)</option>
            </select>
          </div>
        </div>
        <div class="mt-6 flex justify-end gap-2">
          <button type="button" class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium">Descartar alterações</button>
          <button type="button" class="rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white">Salvar regras</button>
        </div>
      </section>

      <AppPageFooter />
    </div>

    <InviteTeamMemberModal
      :open="inviteOpen"
      @close="inviteOpen = false"
      @invited="
        (payload) =>
          showToast(`Convite enviado para ${payload.email} (exemplo). Integração com API em breve.`)
      "
    />
  </div>
</template>
