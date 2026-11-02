<script setup lang="ts">
import { UserPlus, X } from '@lucide/vue'
import { computed, reactive, ref, watch } from 'vue'

import { UiButton, UiIconButton, UiInput } from '@/components/ui'
import { uiSelectClass } from '@/components/ui/uiSelectClass'
import { useEscapeKey } from '@/composables/useEscapeKey'
import type { Sector, TeamAgentRole } from '@/types/team'
import { roleLabels } from '@/utils/teamLabels'

const props = defineProps<{
  open: boolean
  sectors: Sector[]
}>()

const emit = defineEmits<{
  close: []
  invited: [payload: { name: string; email: string; sectorId: number | null; role: TeamAgentRole }]
}>()

const form = reactive({
  name: '',
  email: '',
  sectorId: null as number | null,
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
    form.name = ''
    form.email = ''
    form.sectorId = null
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
    name: form.name.trim(),
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
          <UiIconButton type="button" ariaLabel="Fechar" @click="onClose">
            <X class="h-5 w-5" aria-hidden="true" />
          </UiIconButton>
        </div>

        <p class="mt-2 text-sm text-brand-gray">
          O convidado receberá por e-mail um link para criar a senha (válido por 7 dias).
        </p>

        <div class="mt-4 space-y-3">
          <div class="space-y-1">
            <label class="text-xs font-semibold text-brand-ink" for="invite-name">Nome</label>
            <UiInput
              id="invite-name"
              v-model="form.name"
              type="text"
              autocomplete="name"
              placeholder="Ex.: Ana Paula Silva"
            />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-semibold text-brand-ink" for="invite-email">E-mail *</label>
            <UiInput
              id="invite-email"
              v-model="form.email"
              type="email"
              autocomplete="email"
              placeholder="nome@clinica.com.br"
              :invalid="Boolean(fieldErrors.email)"
            />
            <p v-if="fieldErrors.email" class="text-xs text-red-600">{{ fieldErrors.email }}</p>
          </div>
          <div class="space-y-1">
            <label class="text-xs font-semibold text-brand-ink" for="invite-sector">Setor (opcional)</label>
            <select id="invite-sector" v-model="form.sectorId" :class="uiSelectClass">
              <option :value="null">Sem setor — definir depois</option>
              <option v-for="sector in sectorOptions" :key="sector.id" :value="sector.id">
                {{ sector.label }}
              </option>
            </select>
            <p v-if="fieldErrors.sectorId" class="text-xs text-red-600">{{ fieldErrors.sectorId }}</p>
          </div>
          <div class="space-y-1">
            <label class="text-xs font-semibold text-brand-ink" for="invite-role">Papel *</label>
            <select id="invite-role" v-model="form.role" :class="uiSelectClass">
              <option v-for="[value, label] in roleOptions" :key="value" :value="value">
                {{ label }}
              </option>
            </select>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <UiButton type="button" variant="secondary" @click="onClose"> Cancelar </UiButton>
          <UiButton type="submit" variant="primary"> Enviar convite </UiButton>
        </div>
      </form>
    </div>
  </Teleport>
</template>
