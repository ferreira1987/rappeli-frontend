<script setup lang="ts">
import { UserPlus, X } from '@lucide/vue'
import { computed, reactive, ref, watch } from 'vue'

import { useEscapeKey } from '@/composables/useEscapeKey'
import type { Sector, TeamAgentRole } from '@/types/team'
import { roleLabels } from '@/utils/teamLabels'

const props = defineProps<{
  open: boolean
  sectors: Sector[]
}>()

const emit = defineEmits<{
  close: []
  invited: [payload: { email: string; sectorId: number; role: TeamAgentRole }]
}>()

const form = reactive({
  email: '',
  sectorId: 0,
  role: 'atendente' as TeamAgentRole,
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
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      return
    }
    form.email = ''
    const defaultSector = props.sectors.find((s) => s.is_default) ?? props.sectors[0]
    form.sectorId = defaultSector?.id ?? 0
    form.role = 'atendente'
    fieldErrors.value = {}
  },
)

function validate(): boolean {
  const errors: Record<string, string> = {}
  const email = form.email.trim()
  if (!email) {
    errors.email = 'Informe o e-mail.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Informe um e-mail válido.'
  }
  if (!form.sectorId) {
    errors.sectorId = 'Selecione o setor.'
  }
  fieldErrors.value = errors
  return Object.keys(errors).length === 0
}

function onClose(): void {
  emit('close')
}

function onSubmit(): void {
  if (!validate()) {
    return
  }
  emit('invited', {
    email: form.email.trim(),
    sectorId: form.sectorId,
    role: form.role,
  })
  emit('close')
}

useEscapeKey(
  () => props.open,
  () => onClose(),
)
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-team-title"
      @click.self="onClose"
    >
      <form
        class="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl"
        @submit.prevent="onSubmit"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-2">
            <UserPlus class="h-5 w-5 text-brand-indigo" aria-hidden="true" />
            <h2 id="invite-team-title" class="font-display text-lg font-bold text-brand-ink">
              Convidar atendente
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

        <p class="mt-2 text-sm text-brand-gray">
          O convite é registrado na API. Envio automático de e-mail: Em breve.
        </p>

        <div class="mt-4 space-y-3">
          <div>
            <label class="text-xs font-semibold text-brand-ink" for="invite-email">E-mail *</label>
            <input
              id="invite-email"
              v-model="form.email"
              type="email"
              autocomplete="email"
              placeholder="nome@clinica.com.br"
              class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <p v-if="fieldErrors.email" class="mt-1 text-xs text-red-600">{{ fieldErrors.email }}</p>
          </div>
          <div>
            <label class="text-xs font-semibold text-brand-ink" for="invite-sector">Setor *</label>
            <select
              id="invite-sector"
              v-model.number="form.sectorId"
              class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option v-for="sector in sectorOptions" :key="sector.id" :value="sector.id">
                {{ sector.label }}
              </option>
            </select>
            <p v-if="fieldErrors.sectorId" class="mt-1 text-xs text-red-600">{{ fieldErrors.sectorId }}</p>
          </div>
          <div>
            <label class="text-xs font-semibold text-brand-ink" for="invite-role">Papel *</label>
            <select
              id="invite-role"
              v-model="form.role"
              class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option v-for="[value, label] in roleOptions" :key="value" :value="value">
                {{ label }}
              </option>
            </select>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <button
            type="button"
            class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50"
            @click="onClose"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white hover:bg-brand-indigo-hover"
          >
            Enviar convite
          </button>
        </div>
      </form>
    </div>
  </Teleport>
</template>
