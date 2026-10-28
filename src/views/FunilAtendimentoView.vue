<script setup lang="ts">
import { Calendar, Filter, Loader2, Plus, Search } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import { createFunnelCard, createFunnelStage, deleteFunnelCard, fetchFunnelBoard } from '@/api/funnel'
import AppConfirmModal from '@/components/app/AppConfirmModal.vue'
import FunnelKanbanBoard from '@/components/funnel/FunnelKanbanBoard.vue'
import ExampleFiltersModal from '@/components/app/ExampleFiltersModal.vue'
import AppPageHeader from '@/components/app/AppPageHeader.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import { useEscapeKey } from '@/composables/useEscapeKey'
import type { FunnelCard, FunnelStage } from '@/types/funnel'
import { getErrorMessage, getValidationErrors } from '@/utils/errors'
import { stagesFromApi } from '@/utils/funnelBoardMove'
import { validateBrazilPhoneField } from '@/utils/phone'

const stages = ref<FunnelStage[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const search = ref('')
const filtersOpen = ref(false)
const statusMessage = ref<string | null>(null)

const addStageOpen = ref(false)
const newStageTitle = ref('')
const addStageSubmitting = ref(false)
const addStageErrors = ref<Record<string, string>>({})

const addCardOpen = ref(false)
const addCardStageId = ref<number | null>(null)
const addCardName = ref('')
const addCardPhone = ref('')
const addCardSubmitting = ref(false)
const addCardErrors = ref<Record<string, string>>({})

const deleteCardConfirmOpen = ref(false)
const cardPendingDelete = ref<FunnelCard | null>(null)
const deleteCardSubmitting = ref(false)

const deleteCardMessage = computed(() => {
  if (!cardPendingDelete.value) return ''
  const label =
    cardPendingDelete.value.contact_name || cardPendingDelete.value.phone || `card #${cardPendingDelete.value.id}`
  return `Excluir o card "${label}" do funil? Esta ação não pode ser desfeita.`
})

const cardsByStage = computed(() => {
  const q = search.value.trim().toLowerCase()
  const map = new Map<number, FunnelCard[]>()
  for (const stage of stages.value) {
    const cards = (stage.cards ?? []).filter((card) => {
      if (!q) return true
      const name = (card.contact_name ?? '').toLowerCase()
      const phone = (card.phone ?? '').toLowerCase()
      return name.includes(q) || phone.includes(q)
    })
    map.set(stage.id, cards)
  }
  return map
})

const dragDisabled = computed(() => search.value.trim().length > 0)

async function loadBoard(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    const board = await fetchFunnelBoard()
    stages.value = stagesFromApi(board.stages ?? [])
  } catch (err) {
    error.value = getErrorMessage(err)
    stages.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadBoard()
})

function openAddStage(): void {
  newStageTitle.value = ''
  addStageErrors.value = {}
  addStageOpen.value = true
}

async function submitAddStage(): Promise<void> {
  addStageSubmitting.value = true
  addStageErrors.value = {}
  try {
    await createFunnelStage({ title: newStageTitle.value.trim() })
    addStageOpen.value = false
    await loadBoard()
    statusMessage.value = 'Etapa criada.'
  } catch (err) {
    addStageErrors.value = getValidationErrors(err) ?? {}
    if (!Object.keys(addStageErrors.value).length) {
      statusMessage.value = getErrorMessage(err)
    }
  } finally {
    addStageSubmitting.value = false
  }
}

function openAddCard(stageId: number): void {
  addCardStageId.value = stageId
  addCardName.value = ''
  addCardPhone.value = ''
  addCardErrors.value = {}
  addCardOpen.value = true
}

function requestDeleteCard(card: FunnelCard): void {
  cardPendingDelete.value = card
  deleteCardConfirmOpen.value = true
}

async function confirmDeleteCard(): Promise<void> {
  if (!cardPendingDelete.value) return
  deleteCardSubmitting.value = true
  try {
    await deleteFunnelCard(cardPendingDelete.value.id)
    await loadBoard()
    statusMessage.value = 'Card removido do funil.'
    deleteCardConfirmOpen.value = false
    cardPendingDelete.value = null
  } catch (err) {
    statusMessage.value = getErrorMessage(err)
  } finally {
    deleteCardSubmitting.value = false
  }
}

async function submitAddCard(): Promise<void> {
  if (addCardStageId.value == null) return
  addCardSubmitting.value = true
  addCardErrors.value = {}

  const phoneValidation = validateBrazilPhoneField(addCardPhone.value)
  if (!phoneValidation.ok) {
    addCardErrors.value = { phone: phoneValidation.error }
    addCardSubmitting.value = false
    return
  }

  try {
    await createFunnelCard({
      funnel_stage_id: addCardStageId.value,
      contact_name: addCardName.value.trim() || null,
      phone: phoneValidation.normalized,
    })
    addCardOpen.value = false
    await loadBoard()
    statusMessage.value = 'Card adicionado ao funil.'
  } catch (err) {
    addCardErrors.value = getValidationErrors(err) ?? {}
    if (!Object.keys(addCardErrors.value).length) {
      statusMessage.value = getErrorMessage(err)
    }
  } finally {
    addCardSubmitting.value = false
  }
}

useEscapeKey(
  () => addStageOpen.value || addCardOpen.value,
  () => {
    addStageOpen.value = false
    addCardOpen.value = false
  },
)
</script>

<template>
  <div class="flex min-h-full flex-col bg-brand-mist">
    <AppPageHeader
      title="Funil de atendimento"
      :breadcrumbs="[{ label: 'Painel', to: '/painel' }, { label: 'Funil de atendimento' }]"
    >
      <template #actions>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-brand-ink hover:bg-slate-50"
          @click="filtersOpen = true"
        >
          <Filter class="h-4 w-4 text-brand-gray" />
          Filtros
        </button>
        <RouterLink
          :to="{ name: 'mensagens-agendadas' }"
          class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-brand-ink hover:bg-slate-50"
        >
          <Calendar class="h-4 w-4 text-brand-gray" />
          Agendar mensagem
        </RouterLink>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white hover:bg-brand-indigo-hover disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="!stages.length"
          :title="!stages.length ? 'Crie uma etapa no funil antes de adicionar cards' : undefined"
          @click="stages[0] && openAddCard(stages[0].id)"
        >
          <Plus class="h-4 w-4" />
          Novo card
        </button>
      </template>
    </AppPageHeader>

    <div class="border-b border-slate-200/80 bg-white px-4 py-3 sm:px-6 lg:px-8">
      <div class="flex flex-wrap items-center gap-3">
        <div class="relative min-w-[200px] flex-1">
          <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray" />
          <input
            v-model="search"
            type="search"
            placeholder="Buscar contato…"
            class="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-brand-indigo focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
          />
        </div>
        <button
          type="button"
          class="ml-auto text-sm font-semibold text-brand-indigo hover:underline"
          @click="openAddStage"
        >
          + Adicionar etapa
        </button>
      </div>
    </div>

    <p v-if="statusMessage" class="px-4 pt-4 text-sm text-brand-indigo sm:px-6 lg:px-8" role="status">
      {{ statusMessage }}
    </p>

    <ExampleFiltersModal
      :open="filtersOpen"
      title="Filtros do funil"
      @close="filtersOpen = false"
      @apply="filtersOpen = false"
    />

    <div v-if="loading" class="flex flex-1 items-center justify-center p-12">
      <Loader2 class="h-8 w-8 animate-spin text-brand-indigo" aria-label="Carregando funil" />
    </div>

    <div v-else-if="error" class="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <p class="text-sm text-red-600">{{ error }}</p>
      <button type="button" class="rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white" @click="loadBoard">
        Tentar novamente
      </button>
    </div>

    <div
      v-else-if="!stages.length"
      class="mx-4 my-8 flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center sm:mx-6 lg:mx-8"
    >
      <h2 class="font-display text-lg font-semibold text-brand-ink">Nenhuma etapa no funil</h2>
      <p class="max-w-md text-sm text-brand-gray">
        O funil é organizado em etapas (por exemplo: Novo lead, Em negociação, Fechado). Crie a primeira etapa
        para adicionar cards de contatos — o botão <strong class="text-brand-ink">Novo card</strong> ficará
        disponível depois disso.
      </p>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg bg-brand-indigo px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-indigo-hover"
        @click="openAddStage"
      >
        <Plus class="h-4 w-4" />
        Criar primeira etapa
      </button>
    </div>

    <div v-else class="flex-1 overflow-x-auto p-4 sm:p-6 lg:p-8">
      <FunnelKanbanBoard
        v-model:stages="stages"
        :cards-by-stage="cardsByStage"
        :drag-disabled="dragDisabled"
        @delete-card="requestDeleteCard"
        @status="statusMessage = $event"
      >
        <template #stage-actions="{ stage }">
          <button
            type="button"
            class="ml-auto rounded p-1 text-brand-gray hover:bg-slate-100"
            aria-label="Adicionar card"
            @click="openAddCard(stage.id)"
          >
            <Plus class="h-4 w-4" />
          </button>
        </template>
      </FunnelKanbanBoard>
      <div class="mt-6">
        <AppPageFooter />
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="addStageOpen"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="funnel-add-stage-title"
        @click.self="addStageOpen = false"
      >
        <form class="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl" @submit.prevent="submitAddStage">
          <h3 id="funnel-add-stage-title" class="font-display font-bold text-brand-ink">Nova etapa</h3>
          <input
            v-model="newStageTitle"
            type="text"
            placeholder="Nome da etapa"
            class="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <p v-if="addStageErrors.title" class="mt-1 text-xs text-red-600">{{ addStageErrors.title }}</p>
          <div class="mt-4 flex justify-end gap-2">
            <button type="button" class="rounded-lg border px-3 py-1.5 text-sm" @click="addStageOpen = false">Cancelar</button>
            <button type="submit" class="rounded-lg bg-brand-indigo px-3 py-1.5 text-sm font-semibold text-white" :disabled="addStageSubmitting">
              Criar
            </button>
          </div>
        </form>
      </div>
      <div
        v-if="addCardOpen"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="funnel-add-card-title"
        @click.self="addCardOpen = false"
      >
        <form class="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl" @submit.prevent="submitAddCard">
          <h3 id="funnel-add-card-title" class="font-display font-bold text-brand-ink">Novo card</h3>
          <div class="mt-3 space-y-2">
            <input v-model="addCardName" type="text" placeholder="Nome do contato" class="w-full rounded-lg border px-3 py-2 text-sm" />
            <input
              v-model="addCardPhone"
              type="tel"
              placeholder="Telefone"
              class="w-full rounded-lg border px-3 py-2 text-sm"
              @input="delete addCardErrors.phone"
            />
          </div>
          <p v-for="(msg, key) in addCardErrors" :key="key" class="mt-1 text-xs text-red-600">{{ msg }}</p>
          <div class="mt-4 flex justify-end gap-2">
            <button type="button" class="rounded-lg border px-3 py-1.5 text-sm" @click="addCardOpen = false">Cancelar</button>
            <button type="submit" class="rounded-lg bg-brand-indigo px-3 py-1.5 text-sm font-semibold text-white" :disabled="addCardSubmitting">
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </Teleport>

    <AppConfirmModal
      :open="deleteCardConfirmOpen"
      title="Excluir card"
      :message="deleteCardMessage"
      confirm-label="Excluir"
      :loading="deleteCardSubmitting"
      @close="deleteCardConfirmOpen = false"
      @confirm="confirmDeleteCard"
    />
  </div>
</template>
