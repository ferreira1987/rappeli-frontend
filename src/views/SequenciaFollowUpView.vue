<script setup lang="ts">
import { GripVertical, Loader2, Pencil, Plus, Trash2 } from '@lucide/vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import {
  createSequenceStep,
  deleteSequenceStep,
  enrollSequence,
  fetchSequences,
  findSequenceInList,
  reorderSequenceSteps,
  updateSequenceStep,
} from '@/api/sequences'
import SequenceStepFormModal from '@/components/sequences/SequenceStepFormModal.vue'
import AppPageHeader from '@/components/app/AppPageHeader.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import { panelBreadcrumbs } from '@/constants/panelBreadcrumbs'
import type { Sequence, SequenceStep } from '@/types/campaigns'
import { getErrorMessage } from '@/utils/errors'

const route = useRoute()
const sequences = ref<Sequence[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const enrollIds = ref('')
const enrollMessage = ref<string | null>(null)
const stepsMessage = ref<string | null>(null)

const orderedSteps = ref<SequenceStep[]>([])
const draggedStepId = ref<number | null>(null)
const reordering = ref(false)

const stepModalOpen = ref(false)
const editingStep = ref<SequenceStep | null>(null)
const stepSaving = ref(false)

const sequenceId = computed(() => {
  const raw = route.params.id
  const id = typeof raw === 'string' ? Number(raw) : Number(raw?.[0])
  return Number.isFinite(id) ? id : 0
})

const sequence = computed(() => findSequenceInList(sequences.value, sequenceId.value) ?? null)

function syncSteps(): void {
  orderedSteps.value = [...(sequence.value?.steps ?? [])].sort((a, b) => a.position - b.position)
}

async function load(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    sequences.value = await fetchSequences()
    if (sequenceId.value && !findSequenceInList(sequences.value, sequenceId.value)) {
      error.value = 'Sequência não encontrada.'
    } else {
      syncSteps()
    }
  } catch (err) {
    error.value = getErrorMessage(err)
    sequences.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void load()
})

watch(sequenceId, () => {
  if (!loading.value && sequenceId.value && !sequence.value) {
    error.value = 'Sequência não encontrada.'
  } else {
    syncSteps()
  }
})

watch(sequence, () => syncSteps())

const breadcrumbs = computed(() =>
  panelBreadcrumbs(
    { label: 'Campanhas', to: { name: 'campanhas' } },
    { label: 'Sequências', to: { name: 'campanhas-sequencias' } },
    { label: sequence.value?.name ?? 'Sequência' },
  ),
)

function stepKindLabel(kind: string): string {
  if (kind === 'message') return 'Mensagem'
  if (kind === 'wait') return 'Aguardar'
  if (kind === 'condition') return 'Condição'
  return kind
}

function openCreateStep(): void {
  editingStep.value = null
  stepModalOpen.value = true
}

function openEditStep(step: SequenceStep): void {
  editingStep.value = step
  stepModalOpen.value = true
}

async function onStepSave(payload: {
  kind: 'message' | 'wait' | 'condition'
  label: string | null
  preview: string | null
  wait_minutes: number | null
  message_template_id: number | null
}): Promise<void> {
  if (!sequenceId.value) return
  stepSaving.value = true
  stepsMessage.value = null
  try {
    if (editingStep.value) {
      await updateSequenceStep(sequenceId.value, editingStep.value.id, payload)
      stepsMessage.value = 'Passo atualizado.'
    } else {
      await createSequenceStep(sequenceId.value, payload)
      stepsMessage.value = 'Passo adicionado.'
    }
    stepModalOpen.value = false
    await load()
  } catch (err) {
    stepsMessage.value = getErrorMessage(err)
  } finally {
    stepSaving.value = false
  }
}

async function onDeleteStep(step: SequenceStep): Promise<void> {
  if (!sequenceId.value) return
  if (!window.confirm(`Remover o passo "${step.label || stepKindLabel(step.kind)}"?`)) return
  try {
    await deleteSequenceStep(sequenceId.value, step.id)
    stepsMessage.value = 'Passo removido.'
    await load()
  } catch (err) {
    stepsMessage.value = getErrorMessage(err)
  }
}

function onDragStart(stepId: number): void {
  draggedStepId.value = stepId
}

function onDragOver(event: DragEvent): void {
  event.preventDefault()
}

async function onDrop(targetStepId: number): Promise<void> {
  if (!sequenceId.value || draggedStepId.value == null || draggedStepId.value === targetStepId) {
    draggedStepId.value = null
    return
  }
  const list = [...orderedSteps.value]
  const fromIndex = list.findIndex((s) => s.id === draggedStepId.value)
  const toIndex = list.findIndex((s) => s.id === targetStepId)
  if (fromIndex < 0 || toIndex < 0) {
    draggedStepId.value = null
    return
  }
  const moved = list.splice(fromIndex, 1)[0]
  if (!moved) {
    draggedStepId.value = null
    return
  }
  list.splice(toIndex, 0, moved)
  orderedSteps.value = list
  draggedStepId.value = null
  reordering.value = true
  stepsMessage.value = null
  try {
    await reorderSequenceSteps(sequenceId.value, list.map((s) => s.id))
    stepsMessage.value = 'Ordem dos passos atualizada.'
    await load()
  } catch (err) {
    stepsMessage.value = getErrorMessage(err)
    syncSteps()
  } finally {
    reordering.value = false
  }
}

async function onEnroll(): Promise<void> {
  if (!sequenceId.value) return
  const ids = enrollIds.value
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0)
  if (!ids.length) {
    enrollMessage.value = 'Informe IDs de contato separados por vírgula.'
    return
  }
  try {
    const count = await enrollSequence(sequenceId.value, ids)
    enrollMessage.value = `${count} contato(s) inscritos na sequência.`
    await load()
  } catch (err) {
    enrollMessage.value = getErrorMessage(err)
  }
}
</script>

<template>
  <div class="flex min-h-full flex-col bg-brand-mist">
    <AppPageHeader :title="sequence?.name ?? 'Sequência'" :breadcrumbs="breadcrumbs" />

    <div class="flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div v-if="loading" class="flex justify-center py-16">
        <Loader2 class="h-8 w-8 animate-spin text-brand-indigo" />
      </div>
      <div v-else-if="error" class="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-800">
        {{ error }}
      </div>
      <template v-else-if="sequence">
        <p class="text-sm text-brand-gray">{{ sequence.description || 'Sem descrição' }}</p>
        <p class="text-xs text-brand-gray">
          Gatilho: {{ sequence.trigger ?? '—' }} · Ativa: {{ sequence.active ? 'Sim' : 'Não' }}
        </p>

        <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 class="font-display text-base font-bold text-brand-ink">Passos da sequência</h2>
              <p class="text-xs text-brand-gray">Arraste para reordenar. A ordem é salva automaticamente.</p>
            </div>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg bg-brand-indigo px-3 py-2 text-sm font-semibold text-white"
              @click="openCreateStep"
            >
              <Plus class="h-4 w-4" />
              Novo passo
            </button>
          </div>

          <p v-if="stepsMessage" class="mt-3 text-sm text-brand-indigo" role="status">{{ stepsMessage }}</p>
          <p v-if="reordering" class="mt-2 text-xs text-brand-gray">Salvando ordem…</p>

          <ul class="mt-4 space-y-2">
            <li
              v-for="(step, index) in orderedSteps"
              :key="step.id"
              class="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50/50 p-3"
              draggable="true"
              @dragstart="onDragStart(step.id)"
              @dragover="onDragOver"
              @drop="onDrop(step.id)"
            >
              <button
                type="button"
                class="mt-0.5 cursor-grab rounded p-1 text-brand-gray hover:bg-white"
                aria-label="Reordenar passo"
              >
                <GripVertical class="h-4 w-4" />
              </button>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-brand-ink">
                  {{ index + 1 }}. {{ step.label || stepKindLabel(step.kind) }}
                  <span class="text-xs font-normal text-brand-gray">({{ stepKindLabel(step.kind) }})</span>
                </p>
                <p v-if="step.kind === 'wait'" class="text-xs text-brand-gray">Aguardar {{ step.wait_minutes ?? 0 }} min</p>
                <p v-if="step.preview" class="mt-1 text-xs text-brand-gray">{{ step.preview }}</p>
              </div>
              <div class="flex shrink-0 gap-1">
                <button
                  type="button"
                  class="rounded p-2 text-brand-gray hover:bg-white hover:text-brand-indigo"
                  aria-label="Editar passo"
                  @click="openEditStep(step)"
                >
                  <Pencil class="h-4 w-4" />
                </button>
                <button
                  type="button"
                  class="rounded p-2 text-brand-gray hover:bg-white hover:text-red-600"
                  aria-label="Excluir passo"
                  @click="onDeleteStep(step)"
                >
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </li>
            <li v-if="!orderedSteps.length" class="py-6 text-center text-sm text-brand-gray">
              Nenhum passo cadastrado. Adicione o primeiro passo acima.
            </li>
          </ul>
        </section>

        <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <h2 class="font-display text-base font-bold text-brand-ink">Inscrever contatos (enroll)</h2>
          <input
            v-model="enrollIds"
            type="text"
            placeholder="IDs dos contatos, ex.: 12, 15, 20"
            class="mt-2 w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <button
            type="button"
            class="mt-3 rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white"
            @click="onEnroll"
          >
            Inscrever
          </button>
          <p v-if="enrollMessage" class="mt-2 text-sm text-brand-indigo" role="status">{{ enrollMessage }}</p>
        </section>
      </template>
      <AppPageFooter />
    </div>

    <SequenceStepFormModal
      :open="stepModalOpen"
      :step="editingStep"
      :submitting="stepSaving"
      @close="stepModalOpen = false"
      @save="onStepSave"
    />
  </div>
</template>
