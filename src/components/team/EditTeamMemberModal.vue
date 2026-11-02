<script setup lang="ts">
import { Pencil, X } from '@lucide/vue'
import { computed, reactive, ref, watch } from 'vue'

import { UiButton, UiIconButton, UiInput } from '@/components/ui'
import { uiSelectClass } from '@/components/ui/uiSelectClass'
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
        :aria-busy="submitting || undefined"
        @submit.prevent="onSubmit"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-2">
            <Pencil class="h-5 w-5 text-brand-indigo" aria-hidden="true" />
            <h2 id="edit-team-title" class="font-display text-lg font-bold text-brand-ink">
              Editar colaborador
            </h2>
          </div>
          <UiIconButton type="button" ariaLabel="Fechar" @click="onClose">
            <X class="h-5 w-5" aria-hidden="true" />
          </UiIconButton>
        </div>

        <p class="mt-2 text-sm text-brand-gray">{{ agent.name }} · {{ agent.email }}</p>

        <div class="mt-4 space-y-3">
          <div class="space-y-1">
            <label class="text-xs font-semibold text-brand-ink" for="edit-role">Papel</label>
            <select id="edit-role" v-model="form.role" :class="uiSelectClass">
              <option v-for="[value, label] in roleOptions" :key="value" :value="value">
                {{ label }}
              </option>
            </select>
          </div>
          <div class="space-y-1">
            <label class="text-xs font-semibold text-brand-ink" for="edit-sector">Setor</label>
            <select id="edit-sector" v-model="form.sectorId" :class="uiSelectClass">
              <option :value="null">Sem setor</option>
              <option v-for="sector in sectorOptions" :key="sector.id" :value="sector.id">
                {{ sector.label }}
              </option>
            </select>
          </div>
          <div class="space-y-1">
            <label class="text-xs font-semibold text-brand-ink" for="edit-phone">Telefone</label>
            <UiInput
              id="edit-phone"
              v-model="form.phone"
              type="tel"
              autocomplete="tel"
              placeholder="Opcional"
              :invalid="Boolean(fieldErrors.phone)"
            />
            <p v-if="fieldErrors.phone" class="text-xs text-red-600">{{ fieldErrors.phone }}</p>
          </div>
          <label
            class="flex min-h-11 cursor-pointer items-center justify-between gap-4 rounded-lg border border-slate-100 px-3 py-2.5"
          >
            <span class="text-sm text-brand-ink">Recebe conversas</span>
            <input
              v-model="form.receivesChats"
              type="checkbox"
              class="h-4 w-4 shrink-0 rounded text-brand-indigo focus:ring-brand-indigo"
            />
          </label>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <UiButton type="button" variant="secondary" :disabled="submitting" @click="onClose">
            Cancelar
          </UiButton>
          <UiButton type="submit" variant="primary" :disabled="submitting">
            {{ submitting ? 'Salvando…' : 'Salvar alterações' }}
          </UiButton>
        </div>
      </form>
    </div>
  </Teleport>
</template>
