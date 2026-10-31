<script setup lang="ts">
import { Calendar, Filter, Loader2, Plus, Search } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import { createFunnelCard, createFunnelStage, deleteFunnelCard, fetchFunnelBoard } from '@/api/funnel'
import AppConfirmModal from '@/components/app/AppConfirmModal.vue'
import ExampleFiltersModal from '@/components/app/ExampleFiltersModal.vue'
import EmptyState from '@/components/app/EmptyState.vue'
import FunnelKanbanBoard from '@/components/funnel/FunnelKanbanBoard.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import AppPageShell from '@/components/layout/AppPageShell.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiInput from '@/components/ui/UiInput.vue'
import { useEscapeKey } from '@/composables/useEscapeKey'
import { panelBreadcrumbs } from '@/constants/panelBreadcrumbs'
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

const headerBreadcrumbs = panelBreadcrumbs({ label: 'Automação' }, { label: 'Funil de atendimento' })

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
  <AppPageShell
    title="Funil de atendimento"
    subtitle="Acompanhe e gerencie o fluxo de contatos e negociações em tempo real."
    :breadcrumbs="headerBreadcrumbs"
  >
    <template #actions>
      <UiButton variant="secondary" @click="filtersOpen = true">
        <Filter class="h-4 w-4 text-brand-gray" aria-hidden="true" />
        Filtros
      </UiButton>
      <RouterLink v-slot="{ navigate }" :to="{ name: 'mensagens-agendadas' }" custom>
        <UiButton variant="secondary" @click="navigate">
          <Calendar class="h-4 w-4 text-brand-gray" aria-hidden="true" />
          Agendar mensagem
        </UiButton>
      </RouterLink>
      <UiButton
        :disabled="!stages.length"
        :title="!stages.length ? 'Crie uma etapa no funil antes de adicionar cards' : undefined"
        @click="stages[0] && openAddCard(stages[0].id)"
      >
        <Plus class="h-4 w-4" aria-hidden="true" />
        Novo card
      </UiButton>
    </template>

    <template #toolbar>
      <div class="border-b border-slate-200/80 bg-white px-4 py-3 sm:px-6 lg:px-8">
        <div class="flex flex-wrap items-center gap-3">
          <UiInput
            v-model="search"
            type="search"
            placeholder="Buscar contato…"
            aria-label="Buscar contato"
            class="min-w-[200px] flex-1"
            input-class="w-full bg-slate-50 focus:bg-white"
          >
            <template #leading>
              <Search class="h-4 w-4" aria-hidden="true" />
            </template>
          </UiInput>
          <UiButton variant="ghost" class="ml-auto shrink-0 text-brand-indigo" @click="openAddStage">
            <Plus class="h-4 w-4" aria-hidden="true" />
            Adicionar etapa
          </UiButton>
        </div>
      </div>
    </template>

    <div class="flex min-h-0 flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
      <p v-if="statusMessage" class="mb-4 text-sm text-brand-indigo" role="status">
        {{ statusMessage }}
      </p>

      <ExampleFiltersModal
        :open="filtersOpen"
        title="Filtros do funil"
        @close="filtersOpen = false"
        @apply="filtersOpen = false"
      />

      <div v-if="loading" class="flex flex-1 justify-center py-16">
        <Loader2 class="h-8 w-8 animate-spin text-brand-indigo" aria-label="Carregando funil" />
      </div>

      <div
        v-else-if="error"
        class="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 p-8 text-center"
      >
        <p class="text-sm text-red-800">{{ error }}</p>
        <UiButton @click="loadBoard">Tentar novamente</UiButton>
      </div>

      <EmptyState
        v-else-if="!stages.length"
        title="Nenhuma etapa no funil"
        description="O funil é organizado em etapas (por exemplo: Novo lead, Em negociação, Fechado). Crie a primeira etapa para adicionar cards de contatos — o botão Novo card ficará disponível depois disso."
      >
        <template #actions>
          <UiButton @click="openAddStage">
            <Plus class="h-4 w-4" aria-hidden="true" />
            Criar primeira etapa
          </UiButton>
        </template>
      </EmptyState>

      <template v-else>
        <div class="min-w-0 flex-1 overflow-x-auto">
          <FunnelKanbanBoard
            v-model:stages="stages"
            :cards-by-stage="cardsByStage"
            :drag-disabled="dragDisabled"
            @delete-card="requestDeleteCard"
            @status="statusMessage = $event"
          >
            <template #stage-actions="{ stage }">
              <UiButton
                variant="ghost"
                size="sm"
                class="ml-auto !px-1.5 !py-1"
                aria-label="Adicionar card nesta etapa"
                @click="openAddCard(stage.id)"
              >
                <Plus class="h-4 w-4" aria-hidden="true" />
              </UiButton>
            </template>
          </FunnelKanbanBoard>
        </div>
        <AppPageFooter class="mt-6" />
      </template>
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
        <form
          class="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-xl"
          @submit.prevent="submitAddStage"
        >
          <h3 id="funnel-add-stage-title" class="text-lg font-bold text-brand-ink">Nova etapa</h3>
          <label for="new-stage-title" class="sr-only">Nome da etapa</label>
          <UiInput
            id="new-stage-title"
            v-model="newStageTitle"
            type="text"
            placeholder="Nome da etapa"
            class="mt-3"
            :invalid="Boolean(addStageErrors.title)"
          />
          <p v-if="addStageErrors.title" class="mt-1 text-xs text-red-600">{{ addStageErrors.title }}</p>
          <div class="mt-4 flex justify-end gap-2">
            <UiButton variant="secondary" type="button" @click="addStageOpen = false">Cancelar</UiButton>
            <UiButton type="submit" :disabled="addStageSubmitting">Criar</UiButton>
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
        <form
          class="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-xl"
          @submit.prevent="submitAddCard"
        >
          <h3 id="funnel-add-card-title" class="text-lg font-bold text-brand-ink">Novo card</h3>
          <div class="mt-3 space-y-2">
            <label for="add-card-name" class="sr-only">Nome do contato</label>
            <UiInput id="add-card-name" v-model="addCardName" type="text" placeholder="Nome do contato" />
            <label for="add-card-phone" class="sr-only">Telefone</label>
            <UiInput
              id="add-card-phone"
              v-model="addCardPhone"
              type="tel"
              placeholder="Telefone"
              :invalid="Boolean(addCardErrors.phone)"
              @input="delete addCardErrors.phone"
            />
          </div>
          <p v-for="(msg, key) in addCardErrors" :key="key" class="mt-1 text-xs text-red-600">{{ msg }}</p>
          <div class="mt-4 flex justify-end gap-2">
            <UiButton variant="secondary" type="button" @click="addCardOpen = false">Cancelar</UiButton>
            <UiButton type="submit" :disabled="addCardSubmitting">Adicionar</UiButton>
          </div>
        </form>
      </div>
    </Teleport>

    <AppConfirmModal
      :open="deleteCardConfirmOpen"
      title="Excluir card"
      :message="deleteCardMessage"
      confirm-label="Excluir"
      variant="danger"
      :loading="deleteCardSubmitting"
      @close="deleteCardConfirmOpen = false"
      @confirm="confirmDeleteCard"
    />
  </AppPageShell>
</template>
