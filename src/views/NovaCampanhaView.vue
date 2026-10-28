<script setup lang="ts">
import { Loader2 } from '@lucide/vue'
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import {
  createCampaign,
  fetchCampaign,
  fetchCampaignSegmentPreview,
  updateCampaign,
} from '@/api/campaigns'
import { fetchMessageTemplatesList } from '@/api/messageTemplates'
import AppPageHeader from '@/components/app/AppPageHeader.vue'
import CampaignSendRateSelect from '@/components/campaigns/CampaignSendRateSelect.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import { panelBreadcrumbs } from '@/constants/panelBreadcrumbs'
import type { CampaignStatus } from '@/types/campaigns'
import type { MessageTemplate } from '@/types/messageTemplates'
import {
  applyTemplateBodyParameters,
  formatMetaTemplateVariable,
  isMessageTemplateApproved,
  resolveTemplateVariableIndexes,
} from '@/utils/messageTemplatePreview'
import {
  campaignSendRatePayloadValue,
  normalizeCampaignSendRateForForm,
} from '@/utils/campaignSendRate'
import { getErrorMessage, getValidationErrors } from '@/utils/errors'

const router = useRouter()
const route = useRoute()

const campaignId = computed(() => {
  const raw = route.params.id
  if (raw == null || raw === '') return null
  const id = Number(raw)
  return Number.isFinite(id) ? id : null
})

const isEditMode = computed(() => campaignId.value != null)

const campaignName = ref('')
const optInOnly = ref(true)
const selectedTemplateId = ref<number | null>(null)
const templateBodyParameters = ref<string[]>([])
const sendRate = ref('default')
const scheduleMode = ref<'draft' | 'scheduled'>('draft')
const scheduleDate = ref('')
const scheduleTime = ref('14:30')
const segmentTags = ref('')
const loading = ref(true)
const submitting = ref(false)
const templates = ref<MessageTemplate[]>([])
const formError = ref<string | null>(null)
const fieldErrors = ref<Record<string, string>>({})
const statusMessage = ref<string | null>(null)
const previewCount = ref<number | null>(null)

const pageTitle = computed(() => (isEditMode.value ? 'Editar campanha' : 'Nova campanha'))

const breadcrumbs = computed(() =>
  panelBreadcrumbs(
    { label: 'Campanhas', to: { name: 'campanhas' } },
    { label: pageTitle.value },
  ),
)

const approvedTemplates = computed(() => templates.value.filter((template) => isMessageTemplateApproved(template)))

const selectedTemplate = computed(() =>
  approvedTemplates.value.find((t) => t.id === selectedTemplateId.value),
)

const selectedVariableIndexes = computed(() =>
  resolveTemplateVariableIndexes(selectedTemplate.value?.variables, selectedTemplate.value?.body ?? null),
)

const previewBody = computed(() => {
  const body = selectedTemplate.value?.body ?? ''
  if (!body) {
    return ''
  }
  if (!selectedVariableIndexes.value.length) {
    return body
  }
  return applyTemplateBodyParameters(body, templateBodyParameters.value)
})

function syncTemplateBodyParametersFromSelection(): void {
  const indexes = selectedVariableIndexes.value
  const previous = templateBodyParameters.value
  templateBodyParameters.value = indexes.map((_, index) => previous[index] ?? '')
}

function applyCampaignToForm(campaign: {
  name: string
  opt_in_only: boolean
  segment_tags: string[] | null
  message_template_id: number | null
  template_body_parameters?: string[] | null
  send_rate: string | null
  scheduled_at: string | null
  status: CampaignStatus
}): void {
  campaignName.value = campaign.name
  optInOnly.value = campaign.opt_in_only
  segmentTags.value = campaign.segment_tags?.join(', ') ?? ''
  selectedTemplateId.value = campaign.message_template_id
  templateBodyParameters.value = campaign.template_body_parameters?.length
    ? [...campaign.template_body_parameters]
    : []
  sendRate.value = normalizeCampaignSendRateForForm(campaign.send_rate)

  if (campaign.scheduled_at) {
    scheduleMode.value = 'scheduled'
    const date = new Date(campaign.scheduled_at)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    scheduleDate.value = `${date.getFullYear()}-${month}-${day}`
    scheduleTime.value = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  } else {
    scheduleMode.value = campaign.status === 'agendada' ? 'scheduled' : 'draft'
  }
}

async function loadTemplates(): Promise<void> {
  loading.value = true
  formError.value = null
  try {
    const [templatesResult, existingCampaign] = await Promise.all([
      fetchMessageTemplatesList(),
      isEditMode.value && campaignId.value != null
        ? fetchCampaign(campaignId.value)
        : Promise.resolve(null),
    ])

    templates.value = templatesResult.templates

    if (existingCampaign) {
      if (existingCampaign.status === 'enviando' || existingCampaign.status === 'concluida') {
        formError.value = 'Esta campanha não pode mais ser editada.'
      } else {
        applyCampaignToForm(existingCampaign)
        syncTemplateBodyParametersFromSelection()
      }
    } else {
      const firstApproved = templates.value.find((template) => isMessageTemplateApproved(template))
      if (firstApproved) {
        selectedTemplateId.value = firstApproved.id
        syncTemplateBodyParametersFromSelection()
      }
    }
  } catch (err) {
    formError.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadTemplates()
})

watch(selectedTemplateId, () => {
  syncTemplateBodyParametersFromSelection()
})

function scheduledAtIso(): string | null {
  if (scheduleMode.value !== 'scheduled' || !scheduleDate.value || !scheduleTime.value) return null
  return new Date(`${scheduleDate.value}T${scheduleTime.value}:00`).toISOString()
}

function validateScheduleFields(): boolean {
  fieldErrors.value = {}
  if (scheduleMode.value !== 'scheduled') {
    return true
  }
  const errors: Record<string, string> = {}
  if (!scheduleDate.value.trim()) {
    errors.scheduled_date = 'Informe a data do agendamento.'
  }
  if (!scheduleTime.value.trim()) {
    errors.scheduled_time = 'Informe o horário do agendamento.'
  }
  if (scheduleDate.value.trim() && scheduleTime.value.trim()) {
    const scheduled = new Date(`${scheduleDate.value}T${scheduleTime.value}:00`)
    if (Number.isNaN(scheduled.getTime())) {
      errors.scheduled_date = 'Data ou horário inválidos.'
    } else if (scheduled.getTime() <= Date.now()) {
      errors.scheduled_at = 'A data de agendamento deve ser no futuro.'
    }
  }
  if (Object.keys(errors).length) {
    fieldErrors.value = errors
    return false
  }
  return true
}

function buildPayload(status: 'rascunho' | 'agendada') {
  const tags = segmentTags.value
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  const templateParameters = selectedVariableIndexes.value.length
    ? selectedVariableIndexes.value.map((_, index) => templateBodyParameters.value[index]?.trim() ?? '')
    : undefined

  return {
    name: campaignName.value.trim(),
    opt_in_only: optInOnly.value,
    segment_tags: tags.length ? tags : null,
    message_template_id: selectedTemplateId.value,
    template_body_parameters: templateParameters,
    status,
    scheduled_at: scheduledAtIso(),
    send_rate: campaignSendRatePayloadValue(sendRate.value),
  }
}

async function saveDraft(): Promise<void> {
  await submit('rascunho')
}

async function scheduleCampaign(): Promise<void> {
  if (scheduleMode.value === 'scheduled') {
    if (!validateScheduleFields()) {
      return
    }
    await submit('agendada')
    return
  }
  await saveDraft()
}

async function submit(status: 'rascunho' | 'agendada'): Promise<void> {
  fieldErrors.value = {}
  if (!campaignName.value.trim()) {
    fieldErrors.value = { name: 'Informe o nome da campanha.' }
    return
  }
  if (status === 'agendada' && !validateScheduleFields()) {
    return
  }
  if (formError.value?.includes('não pode mais ser editada')) {
    return
  }

  submitting.value = true
  formError.value = null
  fieldErrors.value = {}

  try {
    const payload = buildPayload(status)

    if (isEditMode.value && campaignId.value != null) {
      await updateCampaign(campaignId.value, payload)
      statusMessage.value = 'Campanha atualizada.'
    } else {
      const campaign = await createCampaign(payload)
      const preview = await fetchCampaignSegmentPreview(campaign.id)
      previewCount.value = preview.count
      statusMessage.value = `Campanha criada. ${preview.count} contatos no segmento.`
    }

    await router.push({ name: 'campanhas' })
  } catch (err) {
    const validation = getValidationErrors(err)
    if (validation) {
      fieldErrors.value = validation
    } else {
      formError.value = getErrorMessage(err)
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="flex min-h-full flex-col bg-brand-mist">
    <AppPageHeader :title="pageTitle" :breadcrumbs="breadcrumbs">
      <template #actions>
        <button
          type="button"
          class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-60"
          :disabled="submitting"
          @click="saveDraft"
        >
          Salvar rascunho
        </button>
        <button
          type="button"
          class="rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          :disabled="submitting"
          @click="scheduleCampaign"
        >
          {{ scheduleMode === 'scheduled' ? 'Agendar campanha' : isEditMode ? 'Salvar campanha' : 'Criar campanha' }}
        </button>
      </template>
    </AppPageHeader>

    <p v-if="statusMessage" class="px-4 text-sm text-brand-indigo lg:px-8" role="status">{{ statusMessage }}</p>
    <p v-if="formError" class="px-4 text-sm text-red-600 lg:px-8" role="alert">{{ formError }}</p>

    <div v-if="loading" class="flex flex-1 items-center justify-center">
      <Loader2 class="h-8 w-8 animate-spin text-brand-indigo" />
    </div>

    <div v-else class="flex flex-1 flex-col gap-6 px-4 py-6 lg:flex-row lg:px-8">
      <div class="min-w-0 flex-1 space-y-4">
        <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <h2 class="text-sm font-bold text-brand-ink">1. Informações da campanha</h2>
          <label class="mt-4 block text-sm font-medium text-brand-ink">Nome da campanha *</label>
          <input
            v-model="campaignName"
            type="text"
            placeholder="Ex.: Lembrete de retorno — pacientes 6 meses"
            class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            @input="delete fieldErrors.name"
          />
          <p v-if="fieldErrors.name" class="mt-1 text-xs text-red-600">{{ fieldErrors.name }}</p>
        </section>

        <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <h2 class="text-sm font-bold text-brand-ink">2. Público (segmento)</h2>
          <label class="mt-4 block text-sm">Tags (separadas por vírgula)</label>
          <input v-model="segmentTags" type="text" class="mt-1 w-full rounded-lg border px-3 py-2 text-sm" placeholder="retorno, limpeza" />
          <label class="mt-4 flex items-center justify-between gap-4 rounded-lg border border-brand-indigo/20 bg-brand-mist/40 p-3">
            <span class="text-sm font-medium text-brand-ink">Somente contatos com opt-in registrado</span>
            <input v-model="optInOnly" type="checkbox" class="h-4 w-4 rounded text-brand-indigo" />
          </label>
          <p v-if="previewCount != null" class="mt-2 text-sm font-semibold text-brand-indigo">
            Última prévia: {{ previewCount }} contatos
          </p>
        </section>

        <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <h2 class="text-sm font-bold text-brand-ink">3. Mensagem (template)</h2>
          <p class="mt-1 text-xs text-brand-gray">Somente modelos aprovados pela Meta.</p>
          <div class="mt-4 space-y-3">
            <label
              v-for="template in approvedTemplates"
              :key="template.id"
              class="flex cursor-pointer items-start gap-3 rounded-lg border p-3"
              :class="selectedTemplateId === template.id ? 'border-brand-indigo bg-brand-mist/30' : 'border-slate-200'"
            >
              <input v-model="selectedTemplateId" type="radio" :value="template.id" class="mt-1" />
              <div>
                <p class="text-sm font-semibold text-brand-ink">{{ template.name }}</p>
                <p class="text-xs text-brand-gray line-clamp-2">{{ template.body }}</p>
              </div>
            </label>
            <p v-if="!approvedTemplates.length" class="text-sm text-brand-gray">
              Nenhum modelo aprovado. Sincronize ou aguarde aprovação em Campanhas → Modelos de mensagem.
            </p>
          </div>

          <div v-if="selectedVariableIndexes.length" class="mt-5 space-y-3 border-t border-slate-100 pt-4">
            <p class="text-sm font-semibold text-brand-ink">Variáveis do modelo</p>
            <div
              v-for="(variableIndex, parameterIndex) in selectedVariableIndexes"
              :key="variableIndex"
            >
              <label class="block text-xs font-medium text-brand-ink">
                Valor para <code>{{ formatMetaTemplateVariable(variableIndex) }}</code>
              </label>
              <input
                v-model="templateBodyParameters[parameterIndex]"
                type="text"
                class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                :placeholder="`Ex.: valor para posição ${variableIndex}`"
              />
              <p
                v-if="fieldErrors[`template_body_parameters.${parameterIndex}`]"
                class="mt-1 text-xs text-red-600"
              >
                {{ fieldErrors[`template_body_parameters.${parameterIndex}`] }}
              </p>
            </div>
            <p v-if="fieldErrors.template_body_parameters" class="text-xs text-red-600">
              {{ fieldErrors.template_body_parameters }}
            </p>
          </div>
        </section>

        <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <h2 class="text-sm font-bold text-brand-ink">4. Velocidade de envio</h2>
          <div class="mt-4">
            <CampaignSendRateSelect v-model="sendRate" :error="fieldErrors.send_rate" />
          </div>
        </section>

        <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <h2 class="text-sm font-bold text-brand-ink">5. Agendamento</h2>
          <div class="mt-3 flex gap-4 text-sm">
            <label class="flex items-center gap-2">
              <input v-model="scheduleMode" type="radio" value="draft" />
              Rascunho
            </label>
            <label class="flex items-center gap-2">
              <input v-model="scheduleMode" type="radio" value="scheduled" />
              Agendar data
            </label>
          </div>
          <div v-if="scheduleMode === 'scheduled'" class="mt-3 grid grid-cols-2 gap-3">
            <div>
              <input
                v-model="scheduleDate"
                type="date"
                class="w-full rounded-lg border px-3 py-2 text-sm"
                @input="delete fieldErrors.scheduled_date"
              />
              <p v-if="fieldErrors.scheduled_date" class="mt-1 text-xs text-red-600">
                {{ fieldErrors.scheduled_date }}
              </p>
            </div>
            <div>
              <input
                v-model="scheduleTime"
                type="time"
                class="w-full rounded-lg border px-3 py-2 text-sm"
                @input="delete fieldErrors.scheduled_time"
              />
              <p v-if="fieldErrors.scheduled_time" class="mt-1 text-xs text-red-600">
                {{ fieldErrors.scheduled_time }}
              </p>
              <p v-if="fieldErrors.scheduled_at" class="mt-1 text-xs text-red-600">
                {{ fieldErrors.scheduled_at }}
              </p>
            </div>
          </div>
        </section>
      </div>

      <aside class="w-full shrink-0 lg:w-80">
        <div class="sticky top-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <p class="text-xs font-semibold uppercase text-brand-gray">Pré-visualização</p>
          <div class="mt-3 rounded-lg bg-[#e5ddd5] p-3 text-sm">{{ previewBody || 'Selecione um template.' }}</div>
          <RouterLink :to="{ name: 'campanhas' }" class="mt-4 inline-block text-sm font-semibold text-brand-indigo">
            Voltar para campanhas
          </RouterLink>
        </div>
      </aside>

      <AppPageFooter class="lg:col-span-2" />
    </div>
  </div>
</template>
