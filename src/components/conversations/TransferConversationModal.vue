<script setup lang="ts">
import { ArrowRightLeft, PauseCircle, X } from '@lucide/vue'
import { computed, ref, watch } from 'vue'

import { useEscapeKey } from '@/composables/useEscapeKey'
import { exampleAgents, exampleSectors } from '@/services/example'

const props = defineProps<{
  open: boolean
  contactName: string
}>()

const emit = defineEmits<{
  close: []
  transferred: []
}>()

const targetMode = ref<'agent' | 'sector'>('sector')
const pauseAutomations = ref(true)
const sectorId = ref('financeiro')
const agentId = ref('auto')
const internalNote = ref('')
const notifyClient = ref(true)

const notifyPreview = computed(() => {
  const sector = exampleSectors.find((s) => s.id === sectorId.value)
  const name = sector?.name ?? 'equipe'
  return `Estamos transferindo você para o setor ${name}.`
})

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      targetMode.value = 'sector'
      sectorId.value = 'financeiro'
      agentId.value = 'auto'
      internalNote.value = ''
      pauseAutomations.value = true
      notifyClient.value = true
    }
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
  emit('transferred')
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
              Transfira esta conversa com {{ contactName }} para outro atendente ou setor da clínica.
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
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-indigo text-white"
            >
              <PauseCircle class="h-4 w-4" />
            </div>
            <div>
              <p class="text-xs font-semibold text-brand-indigo">Transferir para atendimento humano</p>
              <p class="text-[11px] text-brand-gray">
                Pausa as automações nesta conversa e chama um atendente
              </p>
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

        <div class="space-y-4">
          <div v-if="targetMode === 'sector'">
            <label class="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-brand-gray">
              Setor
            </label>
            <select
              v-model="sectorId"
              class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
            >
              <option v-for="sector in exampleSectors" :key="sector.id" :value="sector.id">
                {{ sector.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-brand-gray">
              Atendente (opcional)
            </label>
            <select
              v-model="agentId"
              class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
            >
              <option value="auto">Distribuir automaticamente (rodízio)</option>
              <option v-for="agent in exampleAgents" :key="agent.id" :value="agent.id">
                {{ agent.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-brand-gray">
              Nota interna para quem receber
            </label>
            <textarea
              v-model="internalNote"
              rows="3"
              placeholder="Resuma o contexto do atendimento… Ex: Paciente tem dúvidas sobre parcelamento do procedimento."
              class="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
            />
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
