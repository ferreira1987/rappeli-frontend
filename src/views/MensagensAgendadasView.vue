<script setup lang="ts">
import { Calendar, Filter, Loader2, MessageSquare, Plus, Search } from '@lucide/vue'
import { computed, onMounted, ref, watch } from 'vue'

import {
  cancelScheduledMessage,
  deleteScheduledMessage,
  fetchScheduledMessages,
} from '@/api/scheduledMessages'
import ExampleFiltersModal from '@/components/app/ExampleFiltersModal.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import AppPageShell from '@/components/layout/AppPageShell.vue'
import ScheduleMessageModal from '@/components/scheduled-messages/ScheduleMessageModal.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiFilterChip from '@/components/ui/UiFilterChip.vue'
import UiInput from '@/components/ui/UiInput.vue'
import UiTable from '@/components/ui/UiTable.vue'
import { initialsFromName } from '@/composables/useInitials'
import { panelBreadcrumbs } from '@/constants/panelBreadcrumbs'
import type { ScheduledMessage, ScheduledMessageStatus } from '@/types/scheduledMessages'
import { formatDateTime } from '@/utils/datetime'
import { getErrorMessage } from '@/utils/errors'
import { formatBrazilPhone } from '@/utils/phone'
import { pluralWordPt } from '@/utils/pluralize'

const PAGE_SIZE = 10

const statusChip = ref<ScheduledMessageStatus>('scheduled')
const search = ref('')
const page = ref(1)
const modalOpen = ref(false)
const filtersOpen = ref(false)
const loading = ref(true)
const error = ref<string | null>(null)
const statusMessage = ref<string | null>(null)

const counts = ref<Record<ScheduledMessageStatus, number>>({
  scheduled: 0,
  sent: 0,
  failed: 0,
  cancelled: 0,
})

const rowsByTab = ref<Record<ScheduledMessageStatus, ScheduledMessage[]>>({
  scheduled: [],
  sent: [],
  failed: [],
  cancelled: [],
})

const headerBreadcrumbs = panelBreadcrumbs(
  { label: 'Automação' },
  { label: 'Mensagens agendadas' },
)

const statusFilterOptions: { key: ScheduledMessageStatus; label: string }[] = [
  { key: 'scheduled', label: 'Agendadas' },
  { key: 'sent', label: 'Enviadas' },
  { key: 'failed', label: 'Falharam' },
]

const filteredRows = computed(() => {
  const list = rowsByTab.value[statusChip.value] ?? []
  const q = search.value.trim().toLowerCase()
  if (!q) return list
  return list.filter((row) => {
    const name = row.contact?.display_name?.toLowerCase() ?? ''
    const phone = row.contact?.phone?.toLowerCase() ?? ''
    const body = row.body?.toLowerCase() ?? ''
    return name.includes(q) || phone.includes(q) || body.includes(q)
  })
})

const totalFiltered = computed(() => filteredRows.value.length)

const totalPages = computed(() => Math.max(1, Math.ceil(totalFiltered.value / PAGE_SIZE)))

const paginatedRows = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return filteredRows.value.slice(start, start + PAGE_SIZE)
})

const paginationFrom = computed(() => {
  if (!totalFiltered.value) return 0
  return (page.value - 1) * PAGE_SIZE + 1
})

const paginationTo = computed(() => {
  if (!totalFiltered.value) return 0
  return Math.min(page.value * PAGE_SIZE, totalFiltered.value)
})

const paginationSummaryWord = computed(() => {
  const map: Record<ScheduledMessageStatus, string> = {
    scheduled: 'mensagens agendadas',
    sent: 'mensagens enviadas',
    failed: 'mensagens com falha',
    cancelled: 'mensagens canceladas',
  }
  return map[statusChip.value] ?? pluralWordPt(totalFiltered.value, 'mensagem')
})

watch([statusChip, search], () => {
  page.value = 1
})

watch(totalPages, (pages) => {
  if (page.value > pages) {
    page.value = pages
  }
})

async function loadTab(status: ScheduledMessageStatus): Promise<void> {
  const pageResult = await fetchScheduledMessages({ status, per_page: 100 })
  rowsByTab.value[status] = pageResult.messages
  counts.value[status] = pageResult.meta.total ?? pageResult.messages.length
}

async function loadAll(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    await Promise.all(statusFilterOptions.map((t) => loadTab(t.key)))
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadAll()
})

watch(statusChip, (status) => {
  if (!rowsByTab.value[status]?.length && !loading.value) {
    void loadTab(status).catch(() => undefined)
  }
})

function contactDisplayName(row: ScheduledMessage): string {
  return row.contact?.display_name?.trim() || 'Contato'
}

function contactPhoneLabel(row: ScheduledMessage): string {
  const phone = row.contact?.phone
  if (!phone) return '—'
  return formatBrazilPhone(phone) || phone
}

function contactInitials(row: ScheduledMessage): string {
  return initialsFromName(row.contact?.display_name)
}

function statusLabel(status: ScheduledMessageStatus): string {
  const map: Record<ScheduledMessageStatus, string> = {
    scheduled: 'Agendado',
    sent: 'Enviada',
    failed: 'Falhou',
    cancelled: 'Cancelada',
  }
  return map[status] ?? status
}

function statusBadgeVariant(
  status: ScheduledMessageStatus,
): 'neutral' | 'primary' | 'success' | 'warning' | 'danger' {
  const map: Record<ScheduledMessageStatus, 'neutral' | 'primary' | 'success' | 'warning' | 'danger'> = {
    scheduled: 'warning',
    sent: 'success',
    failed: 'danger',
    cancelled: 'neutral',
  }
  return map[status] ?? 'neutral'
}

function scheduleCellLabel(row: ScheduledMessage): string {
  if (statusChip.value === 'sent' && row.sent_at) {
    return formatDateTime(row.sent_at)
  }
  return row.scheduled_at ? formatDateTime(row.scheduled_at) : '—'
}

async function onScheduled(): Promise<void> {
  statusMessage.value = 'Mensagem agendada com sucesso.'
  await loadAll()
}

async function onCancel(id: number): Promise<void> {
  try {
    await cancelScheduledMessage(id)
    statusMessage.value = 'Agendamento cancelado.'
    await loadAll()
  } catch (err) {
    statusMessage.value = getErrorMessage(err)
  }
}

async function onDelete(id: number): Promise<void> {
  try {
    await deleteScheduledMessage(id)
    statusMessage.value = 'Registro removido.'
    await loadAll()
  } catch (err) {
    statusMessage.value = getErrorMessage(err)
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
    title="Mensagens agendadas"
    subtitle="Gerencie disparos pontuais programados para envio automático via WhatsApp."
    :breadcrumbs="headerBreadcrumbs"
  >
    <template #actions>
      <UiButton variant="secondary" @click="filtersOpen = true">
        <Filter class="h-4 w-4 text-brand-gray" aria-hidden="true" />
        Filtros
      </UiButton>
      <UiButton @click="modalOpen = true">
        <Plus class="h-4 w-4" aria-hidden="true" />
        Agendar mensagem
      </UiButton>
    </template>

    <div class="flex min-h-0 flex-1 flex-col space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <p v-if="statusMessage" class="text-sm text-brand-indigo" role="status">{{ statusMessage }}</p>

      <div v-if="loading" class="flex justify-center py-16">
        <Loader2 class="h-8 w-8 animate-spin text-brand-indigo" aria-label="Carregando mensagens agendadas" />
      </div>

      <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p class="text-sm text-red-800">{{ error }}</p>
        <UiButton class="mt-3" @click="loadAll">Tentar novamente</UiButton>
      </div>

      <UiCard v-else padding="none" class="overflow-hidden">
        <div
          class="flex flex-col gap-4 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
        >
          <div class="flex flex-wrap gap-2" role="group" aria-label="Filtrar mensagens por status">
            <UiFilterChip
              v-for="item in statusFilterOptions"
              :key="item.key"
              :active="statusChip === item.key"
              @click="statusChip = item.key"
            >
              {{ item.label }}
              <span
                class="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold leading-none tabular-nums"
                :class="
                  statusChip === item.key
                    ? 'bg-white/20 text-white'
                    : 'bg-brand-mist text-brand-indigo'
                "
                :aria-label="`${counts[item.key]} ${item.label.toLowerCase()}`"
              >
                {{ counts[item.key] }}
              </span>
            </UiFilterChip>
          </div>

          <UiInput
            v-model="search"
            type="search"
            placeholder="Buscar por contato ou mensagem..."
            aria-label="Buscar por contato ou mensagem"
            class="min-w-0 w-full sm:max-w-xs"
            input-class="w-full"
          >
            <template #leading>
              <Search class="h-4 w-4" aria-hidden="true" />
            </template>
          </UiInput>
        </div>

        <UiTable class="rounded-none border-0">
          <thead>
            <tr>
              <th scope="col">Contato</th>
              <th scope="col">Mensagem</th>
              <th scope="col">Agendamento</th>
              <th scope="col">Status</th>
              <th scope="col" class="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in paginatedRows" :key="row.id">
              <td>
                <div class="flex items-center gap-3">
                  <span
                    class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-mist text-xs font-bold text-brand-indigo"
                    aria-hidden="true"
                  >
                    {{ contactInitials(row) }}
                  </span>
                  <div class="min-w-0">
                    <p class="truncate font-semibold text-brand-ink">{{ contactDisplayName(row) }}</p>
                    <p class="truncate text-xs text-brand-gray">{{ contactPhoneLabel(row) }}</p>
                  </div>
                </div>
              </td>
              <td class="max-w-md">
                <div class="flex items-start gap-2 text-sm text-brand-gray">
                  <MessageSquare class="mt-0.5 h-4 w-4 shrink-0 text-brand-gray" aria-hidden="true" />
                  <span class="line-clamp-2">{{ row.body }}</span>
                </div>
                <p v-if="row.repeat_rule && row.repeat_rule !== 'none'" class="mt-1 text-xs text-brand-gray">
                  Repetição: {{ row.repeat_rule === 'daily' ? 'Diária' : row.repeat_rule === 'weekly' ? 'Semanal' : row.repeat_rule }}
                </p>
              </td>
              <td>
                <div class="flex items-center gap-2 text-sm text-brand-ink">
                  <Calendar class="h-4 w-4 shrink-0 text-brand-gray" aria-hidden="true" />
                  <span>{{ scheduleCellLabel(row) }}</span>
                </div>
              </td>
              <td>
                <div class="space-y-1">
                  <UiBadge :variant="statusBadgeVariant(row.status)" size="md">
                    <span
                      v-if="row.status === 'scheduled'"
                      class="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-500"
                      aria-hidden="true"
                    />
                    {{ statusLabel(row.status) }}
                  </UiBadge>
                  <p v-if="row.status === 'failed' && row.failure_reason" class="max-w-xs text-xs text-red-700">
                    {{ row.failure_reason }}
                  </p>
                </div>
              </td>
              <td class="text-right">
                <div class="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-sm font-semibold">
                  <button
                    v-if="row.status === 'scheduled'"
                    type="button"
                    class="text-brand-gray hover:text-brand-ink hover:underline"
                    @click="onCancel(row.id)"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    class="text-red-600 hover:underline"
                    @click="onDelete(row.id)"
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!paginatedRows.length">
              <td colspan="5" class="py-10 text-center text-sm text-brand-gray">
                Nenhum registro nesta aba.
              </td>
            </tr>
          </tbody>
        </UiTable>

        <div
          class="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
        >
          <p class="text-sm text-brand-gray">
            Exibindo
            <span class="font-medium text-brand-ink">{{ paginationFrom }}</span>
            –
            <span class="font-medium text-brand-ink">{{ paginationTo }}</span>
            de
            <span class="font-medium text-brand-ink">{{ totalFiltered }}</span>
            {{ paginationSummaryWord }}
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

      <AppPageFooter class="mt-auto" />
    </div>

    <ScheduleMessageModal :open="modalOpen" @close="modalOpen = false" @scheduled="onScheduled" />
    <ExampleFiltersModal
      :open="filtersOpen"
      title="Filtros de mensagens agendadas"
      @close="filtersOpen = false"
      @apply="filtersOpen = false"
    />
  </AppPageShell>
</template>
