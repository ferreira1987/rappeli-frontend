<script setup lang="ts">
import { Pencil, X } from '@lucide/vue'
import { computed, reactive, ref, watch } from 'vue'

import { useEscapeKey } from '@/composables/useEscapeKey'
import type { Sector, TeamAgent, TeamAgentRole } from '@/types/team'
import { roleLabels } from '@/utils/teamLabels'

const props = defineProps<{
  open: boolean
  agent: TeamAgent | null
  sectors: Sector[]
  submitting?: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [payload: { role: TeamAgentRole; sectorId: number | null; phone: string | null; receivesChats: boolean }]
}>()

const form = reactive({
  role: 'atendente' as TeamAgentRole,
  sectorId: null as number | null,
  phone: '',
  receivesChats: true,
})

const fieldErrors = ref<Record<string, string>>({})

const roleOptions = Object.entries(roleLabels) as [TeamAgentRole, string][]

const sectorOptions = computed(() =>
  props.sectors.map((sector) => ({
    id: sector.id,
    label: sector.is_default ? `${sector.name} (Padrão)` : sector.name,
  })),
)

watch(
  () => [props.open, props.agent] as const,
  ([isOpen, agent]) => {
    if (!isOpen || !agent) {
      return
    }
    form.role = agent.role
    form.sectorId = agent.sector_id
    form.phone = agent.phone ?? ''
    form.receivesChats = agent.receives_chats
    fieldErrors.value = {}
  },
)

function onClose(): void {
  emit('close')
}

function onSubmit(): void {
  emit('save', {
    role: form.role,
    sectorId: form.sectorId,
    phone: form.phone.trim() || null,
    receivesChats: form.receivesChats,
  })
}

useEscapeKey(
  () => props.open,
  () => onClose(),
)
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open && agent"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-team-title"
      @click.self="onClose"
    >
      <form
        class="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl"
        @submit.prevent="onSubmit"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-2">
            <Pencil class="h-5 w-5 text-brand-indigo" aria-hidden="true" />
            <h2 id="edit-team-title" class="font-display text-lg font-bold text-brand-ink">
              Editar colaborador
            </h2>
          </div>
          <button
            type="button"
            class="rounded-lg p-1.5 text-brand-gray hover:bg-slate-100"
            aria-label="Fechar"
            @click="onClose"
          >
            <X class="h-5 w-5" />
          </button>
        </div>

        <p class="mt-2 text-sm text-brand-gray">{{ agent.name }} · {{ agent.email }}</p>

        <div class="mt-4 space-y-3">
          <div>
            <label class="text-xs font-semibold text-brand-ink" for="edit-role">Papel</label>
            <select
              id="edit-role"
              v-model="form.role"
              class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option v-for="[value, label] in roleOptions" :key="value" :value="value">
                {{ label }}
              </option>
            </select>
          </div>
          <div>
            <label class="text-xs font-semibold text-brand-ink" for="edit-sector">Setor</label>
            <select
              id="edit-sector"
              v-model="form.sectorId"
              class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option :value="null">Sem setor</option>
              <option v-for="sector in sectorOptions" :key="sector.id" :value="sector.id">
                {{ sector.label }}
              </option>
            </select>
          </div>
          <div>
            <label class="text-xs font-semibold text-brand-ink" for="edit-phone">Telefone</label>
            <input
              id="edit-phone"
              v-model="form.phone"
              type="tel"
              autocomplete="tel"
              placeholder="Opcional"
              class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <p v-if="fieldErrors.phone" class="mt-1 text-xs text-red-600">{{ fieldErrors.phone }}</p>
          </div>
          <label class="flex items-center justify-between gap-4 rounded-lg border border-slate-100 px-3 py-2.5">
            <span class="text-sm text-brand-ink">Recebe conversas</span>
            <input v-model="form.receivesChats" type="checkbox" class="h-4 w-4 rounded text-brand-indigo" />
          </label>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <button
            type="button"
            class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50"
            :disabled="submitting"
            @click="onClose"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white hover:bg-brand-indigo-hover disabled:opacity-60"
            :disabled="submitting"
          >
            {{ submitting ? 'Salvando…' : 'Salvar alterações' }}
          </button>
        </div>
      </form>
    </div>
  </Teleport>
</template>
