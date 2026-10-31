<script setup lang="ts">
import { ArrowLeft, Layers, Loader2, Plus, Search, TrendingUp } from '@lucide/vue'
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'

import {
  createSequence,
  deleteSequence,
  fetchSequences,
  updateSequence,
} from '@/api/sequences'
import AppConfirmModal from '@/components/app/AppConfirmModal.vue'
import CreateSequenceModal from '@/components/sequences/CreateSequenceModal.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import AppPageShell from '@/components/layout/AppPageShell.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiFilterChip from '@/components/ui/UiFilterChip.vue'
import UiInput from '@/components/ui/UiInput.vue'
import UiTable from '@/components/ui/UiTable.vue'
import { panelBreadcrumbs } from '@/constants/panelBreadcrumbs'
import type { Sequence } from '@/types/campaigns'
import { getErrorMessage } from '@/utils/errors'
import { pluralWordPt, pluralizePt } from '@/utils/pluralize'

const PAGE_SIZE = 10

type StatusFilter = 'all' | 'active' | 'paused'

const sequences = ref<Sequence[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const creating = ref(false)
const createModalOpen = ref(false)
const actionMessage = ref<string | null>(null)
const togglingId = ref<number | null>(null)

const statusChip = ref<StatusFilter>('all')
const search = ref('')
const page = ref(1)

const deleteConfirmOpen = ref(false)
const sequencePendingDelete = ref<Sequence | null>(null)
const deleteSubmitting = ref(false)

const headerBreadcrumbs = panelBreadcrumbs(
  { label: 'Campanhas', to: { name: 'campanhas' } },
  { label: 'Sequências' },
)

const pageSubtitle =
  'Automação de mensagens sequenciais programadas por intervalos de tempo e condições de resposta.'

const statusFilterOptions: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'active', label: 'Ativas' },
  { id: 'paused', label: 'Pausadas' },
]

const deleteConfirmMessage = computed(() => {
  if (!sequencePendingDelete.value) return ''
  return `Excluir a sequência "${sequencePendingDelete.value.name}"? Esta ação não pode ser desfeita.`
})

function countByStatus(filter: StatusFilter): number {
  if (filter === 'all') return sequences.value.length
  if (filter === 'active') return sequences.value.filter((s) => s.active).length
  return sequences.value.filter((s) => !s.active).length
}

const filteredSequences = computed(() => {
  let list = sequences.value
  if (statusChip.value === 'active') {
    list = list.filter((s) => s.active)
  } else if (statusChip.value === 'paused') {
    list = list.filter((s) => !s.active)
  }
  const q = search.value.trim().toLowerCase()
  if (q) {
    list = list.filter((s) => s.name.toLowerCase().includes(q))
  }
  return list
})

const totalFiltered = computed(() => filteredSequences.value.length)

const showResponseRateColumn = computed(() =>
  sequences.value.some((s) => hasResponseRate(s)),
)

const emptyTableMessage = computed(() =>
  sequences.value.length ? 'Nenhuma sequência encontrada.' : 'Nenhuma sequência cadastrada.',
)

const totalPages = computed(() => Math.max(1, Math.ceil(totalFiltered.value / PAGE_SIZE)))

const paginatedSequences = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return filteredSequences.value.slice(start, start + PAGE_SIZE)
})

const paginationFrom = computed(() => {
  if (!totalFiltered.value) return 0
  return (page.value - 1) * PAGE_SIZE + 1
})

const paginationTo = computed(() => {
  if (!totalFiltered.value) return 0
  return Math.min(page.value * PAGE_SIZE, totalFiltered.value)
})

watch([statusChip, search], () => {
  page.value = 1
})

watch(totalPages, (pages) => {
  if (page.value > pages) {
    page.value = pages
  }
})

async function load(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    sequences.value = await fetchSequences()
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void load()
})

function openCreateModal(): void {
  createModalOpen.value = true
}

async function confirmCreateSequence(name: string): Promise<void> {
  creating.value = true
  actionMessage.value = null
  try {
    await createSequence({ name, active: true })
    createModalOpen.value = false
    await load()
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    creating.value = false
  }
}

function sequenceDescription(seq: Sequence): string {
  return seq.description?.trim() ? seq.description : 'Sem descrição'
}

function stepsCount(seq: Sequence): number {
  return seq.steps?.length ?? 0
}

function stepsSummaryLine(seq: Sequence): string {
  return `${stepsCount(seq)} passos · ${seq.contacts_in_progress ?? 0} em andamento`
}

function statusLabel(seq: Sequence): string {
  return seq.active ? 'Ativa' : 'Pausada'
}

function statusBadgeVariant(seq: Sequence): 'success' | 'neutral' {
  return seq.active ? 'success' : 'neutral'
}

function contactsInProgressLabel(seq: Sequence): string {
  const count = seq.contacts_in_progress ?? 0
  return `${count} em andamento`
}

function hasResponseRate(
  seq: Sequence & { response_rate?: number | null; reply_rate?: number | null },
): boolean {
  const rate = seq.response_rate ?? seq.reply_rate
  return typeof rate === 'number' && Number.isFinite(rate)
}

function responseRateLabel(
  seq: Sequence & { response_rate?: number | null; reply_rate?: number | null },
): string {
  const rate = seq.response_rate ?? seq.reply_rate ?? 0
  return `${Math.round(rate)}%`
}

async function toggleSequenceActive(seq: Sequence): Promise<void> {
  togglingId.value = seq.id
  actionMessage.value = null
  try {
    await updateSequence(seq.id, { active: !seq.active })
    actionMessage.value = seq.active ? 'Sequência pausada.' : 'Sequência ativada.'
    await load()
  } catch (err) {
    actionMessage.value = getErrorMessage(err)
  } finally {
    togglingId.value = null
  }
}

function requestDeleteSequence(seq: Sequence): void {
  sequencePendingDelete.value = seq
  deleteConfirmOpen.value = true
}

async function confirmDeleteSequence(): Promise<void> {
  const seq = sequencePendingDelete.value
  if (!seq) return
  deleteSubmitting.value = true
  actionMessage.value = null
  try {
    await deleteSequence(seq.id)
    actionMessage.value = 'Sequência excluída.'
    deleteConfirmOpen.value = false
    sequencePendingDelete.value = null
    await load()
  } catch (err) {
    actionMessage.value = getErrorMessage(err)
  } finally {
    deleteSubmitting.value = false
  }
}

function goToPreviousPage(): void {
  page.value = Math.max(1, page.value - 1)
}

function goToNextPage(): void {
  page.value = Math.min(totalPages.value, page.value + 1)
}
</script>

<template>
  <AppPageShell
    title="Sequências"
    :subtitle="pageSubtitle"
    :breadcrumbs="headerBreadcrumbs"
  >
    <template #actions>
      <RouterLink :to="{ name: 'campanhas' }" class="inline-flex">
        <UiButton variant="secondary">
          <ArrowLeft class="h-4 w-4 text-brand-gray" aria-hidden="true" />
          Voltar para campanhas
        </UiButton>
      </RouterLink>
      <UiButton :disabled="creating" @click="openCreateModal">
        <Plus class="h-4 w-4" aria-hidden="true" />
        Nova sequência
      </UiButton>
    </template>

    <div class="flex min-h-0 flex-1 flex-col space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <p v-if="actionMessage" class="text-sm text-brand-indigo" role="status">{{ actionMessage }}</p>

      <div v-if="loading" class="flex justify-center py-16">
        <Loader2 class="h-8 w-8 animate-spin text-brand-indigo" aria-label="Carregando sequências" />
      </div>

      <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p class="text-sm text-red-800">{{ error }}</p>
        <UiButton class="mt-3" @click="load">Tentar novamente</UiButton>
      </div>

      <template v-else>
        <p class="text-sm text-brand-gray">
          {{ pluralizePt(sequences.length, 'sequência') }} — enroll e passos via API.
        </p>

        <UiCard padding="none" class="overflow-hidden">
          <div class="space-y-4 border-b border-slate-100 px-4 py-4 sm:px-5">
            <UiInput
              v-model="search"
              type="search"
              placeholder="Buscar sequência por nome..."
              class="min-w-0 w-full"
              input-class="w-full"
            >
              <template #leading>
                <Search class="h-4 w-4" aria-hidden="true" />
              </template>
            </UiInput>

            <div class="flex flex-wrap items-center gap-2">
              <span class="text-sm font-medium text-brand-gray">Status:</span>
              <div class="flex flex-wrap gap-2" role="group" aria-label="Filtrar sequências por status">
                <UiFilterChip
                  v-for="option in statusFilterOptions"
                  :key="option.id"
                  :active="statusChip === option.id"
                  @click="statusChip = option.id"
                >
                  {{ option.label }}
                  <span
                    class="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold leading-none tabular-nums"
                    :class="
                      statusChip === option.id
                        ? 'bg-white/20 text-white'
                        : 'bg-brand-mist text-brand-indigo'
                    "
                    :aria-label="`${countByStatus(option.id)} sequências`"
                  >
                    {{ countByStatus(option.id) }}
                  </span>
                </UiFilterChip>
              </div>
            </div>
          </div>

          <UiTable class="rounded-none border-0">
            <thead>
              <tr>
                <th scope="col">Sequência</th>
                <th scope="col">Etapas</th>
                <th scope="col">Contatos em andamento</th>
                <th v-if="showResponseRateColumn" scope="col">Taxa de resposta</th>
                <th scope="col">Status</th>
                <th scope="col" class="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="seq in paginatedSequences" :key="seq.id">
                <td>
                  <div class="min-w-0">
                    <RouterLink
                      :to="{ name: 'campanhas-sequencia-detalhe', params: { id: seq.id } }"
                      class="font-semibold text-brand-ink hover:text-brand-indigo hover:underline"
                    >
                      {{ seq.name }}
                    </RouterLink>
                    <p class="mt-1 text-xs text-brand-gray">{{ sequenceDescription(seq) }}</p>
                    <p class="mt-1 text-[11px] text-brand-gray">{{ stepsSummaryLine(seq) }}</p>
                  </div>
                </td>
                <td>
                  <div class="flex items-center gap-2 text-sm text-brand-ink">
                    <Layers class="h-4 w-4 shrink-0 text-brand-gray" aria-hidden="true" />
                    <span>{{ pluralizePt(stepsCount(seq), 'etapa') }}</span>
                  </div>
                </td>
                <td>
                  <UiBadge :variant="seq.contacts_in_progress ? 'primary' : 'neutral'" size="md">
                    <span
                      class="mr-1.5 inline-block h-1.5 w-1.5 rounded-full"
                      :class="seq.contacts_in_progress ? 'bg-brand-indigo' : 'bg-slate-400'"
                      aria-hidden="true"
                    />
                    {{ contactsInProgressLabel(seq) }}
                  </UiBadge>
                </td>
                <td v-if="showResponseRateColumn">
                  <div
                    v-if="hasResponseRate(seq)"
                    class="flex items-center gap-1.5 text-sm font-semibold text-brand-ink"
                  >
                    <span>{{ responseRateLabel(seq) }}</span>
                    <TrendingUp class="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  </div>
                </td>
                <td>
                  <UiBadge :variant="statusBadgeVariant(seq)" size="md">
                    <span
                      class="mr-1.5 inline-block h-1.5 w-1.5 rounded-full"
                      :class="seq.active ? 'bg-emerald-500' : 'bg-slate-400'"
                      aria-hidden="true"
                    />
                    {{ statusLabel(seq) }}
                  </UiBadge>
                </td>
                <td class="text-right">
                  <div class="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-sm font-semibold">
                    <RouterLink
                      :to="{ name: 'campanhas-sequencia-detalhe', params: { id: seq.id } }"
                      class="text-brand-indigo hover:underline"
                    >
                      Editar
                    </RouterLink>
                    <button
                      type="button"
                      class="text-brand-indigo hover:underline disabled:opacity-60"
                      :disabled="togglingId === seq.id"
                      @click="toggleSequenceActive(seq)"
                    >
                      {{ togglingId === seq.id ? 'Salvando…' : seq.active ? 'Pausar' : 'Ativar' }}
                    </button>
                    <RouterLink
                      :to="{ name: 'campanhas-sequencia-detalhe', params: { id: seq.id } }"
                      class="text-brand-indigo hover:underline"
                    >
                      Ver contatos
                    </RouterLink>
                    <button
                      type="button"
                      class="text-red-600 hover:underline disabled:opacity-60"
                      :disabled="deleteSubmitting"
                      @click="requestDeleteSequence(seq)"
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!paginatedSequences.length">
                <td
                  :colspan="showResponseRateColumn ? 6 : 5"
                  class="py-10 text-center text-sm text-brand-gray"
                >
                  {{ emptyTableMessage }}
                </td>
              </tr>
            </tbody>
          </UiTable>

          <div
            class="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
          >
            <p class="text-sm text-brand-gray">
              <template v-if="totalFiltered">
                Exibindo
                <span class="font-medium text-brand-ink">{{ paginationFrom }}</span>
                –
                <span class="font-medium text-brand-ink">{{ paginationTo }}</span>
                de
                <span class="font-medium text-brand-ink">{{ totalFiltered }}</span>
                {{ pluralWordPt(totalFiltered, 'sequência') }}
              </template>
              <template v-else>
                Exibindo 0 {{ pluralWordPt(0, 'sequência') }}
              </template>
            </p>
            <div class="flex items-center gap-2">
              <UiButton
                variant="secondary"
                size="sm"
                :disabled="page <= 1 || !totalFiltered"
                @click="goToPreviousPage"
              >
                Anterior
              </UiButton>
              <span
                v-if="totalFiltered"
                class="inline-flex min-h-8 min-w-8 items-center justify-center rounded-lg bg-brand-indigo px-2 text-sm font-semibold text-white"
                aria-current="page"
              >
                {{ page }}
              </span>
              <UiButton
                variant="secondary"
                size="sm"
                :disabled="page >= totalPages || !totalFiltered"
                @click="goToNextPage"
              >
                Próxima
              </UiButton>
            </div>
          </div>
        </UiCard>
      </template>

      <AppPageFooter class="mt-auto" />
    </div>

    <CreateSequenceModal
      :open="createModalOpen"
      :submitting="creating"
      @close="createModalOpen = false"
      @create="confirmCreateSequence"
    />

    <AppConfirmModal
      :open="deleteConfirmOpen"
      title="Excluir sequência"
      :message="deleteConfirmMessage"
      confirm-label="Excluir"
      variant="danger"
      :loading="deleteSubmitting"
      @close="deleteConfirmOpen = false"
      @confirm="confirmDeleteSequence"
    />
  </AppPageShell>
</template>
