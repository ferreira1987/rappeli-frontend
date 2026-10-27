<script setup lang="ts">
import { ArrowRightLeft, Loader2, PauseCircle, X } from '@lucide/vue'
import { computed, ref, watch } from 'vue'

import type { TransferConversationPayload } from '@/api/inbox'
import { fetchSectors, fetchTeamAgents } from '@/api/team'
import { useEscapeKey } from '@/composables/useEscapeKey'
import type { Sector, TeamAgent } from '@/types/team'
import { formatAgentDisplayName } from '@/utils/teamLabels'

const props = defineProps<{
  open: boolean
  contactName: string
}>()

const emit = defineEmits<{
  close: []
  transferred: [payload: TransferConversationPayload]
}>()

const targetMode = ref<'agent' | 'sector'>('agent')
const pauseAutomations = ref(true)
const sectorId = ref<number | null>(null)
const assigneeUserId = ref<number | null>(null)
const internalNote = ref('')
const notifyClient = ref(true)

const agents = ref<TeamAgent[]>([])
const sectors = ref<Sector[]>([])
const loading = ref(false)
const fieldErrors = ref<Record<string, string>>({})

const selectedAgent = computed(() => agents.value.find((a) => a.id === assigneeUserId.value) ?? null)

function agentNameForNotify(agent: TeamAgent): string {
  return formatAgentDisplayName(agent, agents.value)
}

const notifyPreview = computed(() => {
  if (targetMode.value === 'agent') {
    const agent = selectedAgent.value
    if (agent) {
      return `Estamos transferindo você para o atendimento de ${agentNameForNotify(agent)}.`
    }
    return 'Estamos transferindo você para outro atendente.'
  }
  const sector = sectors.value.find((s) => s.id === sectorId.value)
  if (sector?.name) {
    const agent = selectedAgent.value
    if (agent) {
      return `Estamos transferindo você para o setor ${sector.name} (${agentNameForNotify(agent)}).`
    }
    return `Estamos transferindo você para o setor ${sector.name}.`
  }
  return 'Estamos transferindo você para nossa equipe.'
})

async function loadOptions(): Promise<void> {
  loading.value = true
  try {
    const [agentList, sectorList] = await Promise.all([fetchTeamAgents(), fetchSectors()])
    agents.value = agentList
    sectors.value = sectorList
    if (sectorId.value == null) {
      const defaultSector = sectorList.find((s) => s.is_default) ?? sectorList[0]
      sectorId.value = defaultSector?.id ?? null
    }
  } catch {
    agents.value = []
    sectors.value = []
  } finally {
    loading.value = false
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    targetMode.value = 'agent'
    assigneeUserId.value = null
    internalNote.value = ''
    notifyClient.value = true
    pauseAutomations.value = true
    fieldErrors.value = {}
    void loadOptions()
  },
)

function onClose(): void {
  emit('close')
}

useEscapeKey(
  () => props.open,
  () => onClose(),
)

function onSubmit(): void {
  fieldErrors.value = {}
  const payload: TransferConversationPayload = {
    note: internalNote.value.trim() || null,
    notify_client: notifyClient.value,
  }
  if (targetMode.value === 'sector') {
    if (sectorId.value == null) {
      fieldErrors.value = { sector_id: 'Selecione um setor.' }
      return
    }
    payload.sector_id = sectorId.value
    if (assigneeUserId.value != null) {
      payload.assignee_user_id = assigneeUserId.value
    }
  } else {
    if (assigneeUserId.value == null) {
      fieldErrors.value = { assignee_user_id: 'Selecione um atendente.' }
      return
    }
    payload.assignee_user_id = assigneeUserId.value
  }
  emit('transferred', payload)
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transfer-modal-title"
      @click.self="onClose"
    >
      <div class="flex w-full max-w-lg flex-col gap-5 rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 id="transfer-modal-title" class="font-display text-lg font-bold text-brand-ink">
              Transferir atendimento
            </h2>
            <p class="mt-0.5 text-xs text-brand-gray">
              Transfira esta conversa com {{ contactName }} para outro atendente ou setor.
            </p>
          </div>
          <button
            type="button"
            class="rounded-lg p-1.5 text-brand-gray hover:bg-slate-100 hover:text-brand-ink"
            aria-label="Fechar"
            @click="onClose"
          >
            <X class="h-5 w-5" />
          </button>
        </div>

        <label
          class="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-brand-indigo/20 bg-brand-mist/80 p-3"
        >
          <div class="flex items-center gap-2.5">
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-indigo text-white">
              <PauseCircle class="h-4 w-4" />
            </div>
            <div>
              <p class="text-xs font-semibold text-brand-indigo">Transferir para atendimento humano</p>
              <p class="text-[11px] text-brand-gray">Pausa automações nesta conversa (preferência local)</p>
            </div>
          </div>
          <input v-model="pauseAutomations" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-brand-indigo" />
        </label>

        <div class="flex rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            class="flex-1 rounded-md py-1.5 text-xs font-medium transition"
            :class="
              targetMode === 'agent'
                ? 'bg-white font-semibold text-brand-indigo shadow-xs'
                : 'text-brand-gray hover:text-brand-ink'
            "
            @click="targetMode = 'agent'"
          >
            Para atendente
          </button>
          <button
            type="button"
            class="flex-1 rounded-md py-1.5 text-xs font-medium transition"
            :class="
              targetMode === 'sector'
                ? 'bg-white font-semibold text-brand-indigo shadow-xs'
                : 'text-brand-gray hover:text-brand-ink'
            "
            @click="targetMode = 'sector'"
          >
            Para setor
          </button>
        </div>

        <div v-if="loading" class="flex items-center gap-2 text-sm text-brand-gray">
          <Loader2 class="h-4 w-4 animate-spin" /> Carregando equipe…
        </div>

        <div v-else class="space-y-4">
          <div v-if="targetMode === 'sector'">
            <label class="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-brand-gray">Setor *</label>
            <select
              v-model.number="sectorId"
              class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option :value="null" disabled>Selecione…</option>
              <option v-for="sector in sectors" :key="sector.id" :value="sector.id">
                {{ sector.name }}
              </option>
            </select>
            <p v-if="fieldErrors.sector_id" class="mt-1 text-xs text-red-600">{{ fieldErrors.sector_id }}</p>
          </div>

          <div>
            <label class="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-brand-gray">
              Atendente {{ targetMode === 'sector' ? '(opcional)' : '*' }}
            </label>
            <select
              v-model.number="assigneeUserId"
              class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option :value="null">{{ targetMode === 'sector' ? 'Distribuir automaticamente' : 'Selecione…' }}</option>
              <option v-for="agent in agents" :key="agent.id" :value="agent.id">
                {{ formatAgentDisplayName(agent, agents) }}
              </option>
            </select>
            <p v-if="fieldErrors.assignee_user_id" class="mt-1 text-xs text-red-600">
              {{ fieldErrors.assignee_user_id }}
            </p>
          </div>

          <div>
            <label class="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-brand-gray">
              Nota interna
            </label>
            <textarea
              v-model="internalNote"
              rows="3"
              placeholder="Resuma o contexto do atendimento…"
              class="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <p v-if="fieldErrors.note" class="mt-1 text-xs text-red-600">{{ fieldErrors.note }}</p>
          </div>

          <label class="flex cursor-pointer items-start gap-2 text-xs text-brand-ink">
            <input v-model="notifyClient" type="checkbox" class="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-indigo" />
            <span>
              Enviar aviso ao cliente:
              <span class="text-brand-gray">"{{ notifyPreview }}"</span>
            </span>
          </label>
        </div>

        <div class="flex justify-end gap-2 border-t border-slate-100 pt-2">
          <button
            type="button"
            class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-brand-ink hover:bg-slate-50"
            @click="onClose"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white hover:bg-brand-indigo-hover"
            :disabled="loading"
            @click="onSubmit"
          >
            <ArrowRightLeft class="h-4 w-4" />
            Transferir
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
