<script setup lang="ts">
import { ArrowRightLeft, Loader2, X } from '@lucide/vue'
import { onMounted, ref, watch } from 'vue'

import { fetchTeamAgents } from '@/api/team'
import { useEscapeKey } from '@/composables/useEscapeKey'
import type { TeamAgent } from '@/types/team'

const props = defineProps<{
  open: boolean
  contactName: string
}>()

const emit = defineEmits<{
  close: []
  transferred: [assigneeUserId: number]
}>()

const agents = ref<TeamAgent[]>([])
const agentsLoading = ref(false)
const assigneeUserId = ref<number | null>(null)
const submitError = ref<string | null>(null)
const fieldErrors = ref<Record<string, string>>({})

async function loadAgents(): Promise<void> {
  agentsLoading.value = true
  try {
    agents.value = await fetchTeamAgents()
    if (!assigneeUserId.value && agents.value[0]) {
      assigneeUserId.value = agents.value[0].id
    }
  } catch {
    agents.value = []
  } finally {
    agentsLoading.value = false
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      assigneeUserId.value = null
      submitError.value = null
      fieldErrors.value = {}
      void loadAgents()
    }
  },
)

onMounted(() => {
  if (props.open) {
    void loadAgents()
  }
})

function onClose(): void {
  emit('close')
}

useEscapeKey(
  () => props.open,
  () => onClose(),
)

function onSubmit(): void {
  if (assigneeUserId.value == null) {
    fieldErrors.value = { assignee_user_id: 'Selecione um atendente.' }
    return
  }
  emit('transferred', assigneeUserId.value)
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
              Transfira esta conversa com {{ contactName }} para outro atendente.
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

        <p class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Transferência para setor com nota interna ou aviso ao cliente: Em breve. A API aceita apenas
          <strong>assignee_user_id</strong>.
        </p>

        <p v-if="submitError" class="text-sm text-red-600" role="alert">{{ submitError }}</p>

        <div>
          <label class="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-brand-gray">
            Atendente *
          </label>
          <div v-if="agentsLoading" class="flex items-center gap-2 text-sm text-brand-gray">
            <Loader2 class="h-4 w-4 animate-spin" /> Carregando equipe…
          </div>
          <select
            v-else
            v-model.number="assigneeUserId"
            class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
          >
            <option :value="null" disabled>Selecione…</option>
            <option v-for="agent in agents" :key="agent.id" :value="agent.id">
              {{ agent.name }}
            </option>
          </select>
          <p v-if="fieldErrors.assignee_user_id" class="mt-1 text-xs text-red-600">
            {{ fieldErrors.assignee_user_id }}
          </p>
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
