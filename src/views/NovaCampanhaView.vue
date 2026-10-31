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
import CampaignSendRateSelect from '@/components/campaigns/CampaignSendRateSelect.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import AppPageShell from '@/components/layout/AppPageShell.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiFilterChip from '@/components/ui/UiFilterChip.vue'
import UiInput from '@/components/ui/UiInput.vue'
import { panelBreadcrumbs } from '@/constants/panelBreadcrumbs'
import type { CampaignStatus } from '@/types/campaigns'
import type { MessageTemplate } from '@/types/messageTemplates'
import {
  campaignSendRatePayloadValue,
  normalizeCampaignSendRateForForm,
} from '@/utils/campaignSendRate'
import { getErrorMessage, getValidationErrors } from '@/utils/errors'
import { messageTemplateCategoryLabel, messageTemplateStatusLabel } from '@/utils/messageTemplateLabels'
import {
  applyTemplateBodyParameters,
  formatMetaTemplateVariable,
  isMessageTemplateApproved,
  resolveTemplateVariableIndexes,
} from '@/utils/messageTemplatePreview'

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

const pageSubtitle =
  'Configure o envio em massa via WhatsApp Cloud API respeitando opt-in e cadência de segurança.'

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

const primaryActionLabel = computed(() =>
  scheduleMode.value === 'scheduled' ? 'Agendar campanha' : isEditMode.value ? 'Salvar campanha' : 'Criar campanha',
)

function templateMetaLine(template: MessageTemplate): string | null {
  const parts: string[] = []
  const category = messageTemplateCategoryLabel(template.category)
  if (category && category !== '—') {
    parts.push(category)
  }
  const status = messageTemplateStatusLabel(template.status)
  if (status) {
    parts.push(`${status} pela Meta`)
  }
  return parts.length ? parts.join(' • ') : null
}

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

function setScheduleMode(mode: 'draft' | 'scheduled'): void {
  scheduleMode.value = mode
}
</script>

<template>
  <AppPageShell :title="pageTitle" :subtitle="pageSubtitle" :breadcrumbs="breadcrumbs">
    <template #actions>
      <RouterLink :to="{ name: 'campanhas' }" class="inline-flex">
        <UiButton variant="secondary" size="sm" :disabled="submitting">Cancelar</UiButton>
      </RouterLink>
      <UiButton variant="secondary" size="sm" :disabled="submitting" @click="saveDraft">
        Salvar rascunho
      </UiButton>
      <UiButton size="sm" :disabled="submitting" @click="scheduleCampaign">
        {{ primaryActionLabel }}
      </UiButton>
    </template>

    <div class="flex min-h-0 flex-1 flex-col">
      <p v-if="statusMessage" class="px-4 pt-4 text-sm text-brand-indigo sm:px-6 lg:px-8" role="status">
        {{ statusMessage }}
      </p>
      <p v-if="formError" class="px-4 pt-4 text-sm text-red-600 sm:px-6 lg:px-8" role="alert">
        {{ formError }}
      </p>

      <div v-if="loading" class="flex flex-1 items-center justify-center py-24">
        <Loader2 class="h-8 w-8 animate-spin text-brand-indigo" aria-label="Carregando" />
      </div>

      <div v-else class="mx-auto w-full max-w-[1240px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <div class="space-y-6 lg:col-span-7">
            <UiCard padding="lg" class="shadow-none">
              <h2 class="border-b border-slate-100 pb-3 text-base font-semibold text-brand-ink">Informações</h2>
              <label for="campaign-name" class="mt-4 block text-sm font-medium text-brand-ink">
                Nome da campanha *
              </label>
              <UiInput
                id="campaign-name"
                v-model="campaignName"
                input-class="mt-1"
                placeholder="Ex.: Lembrete de retorno — pacientes 6 meses"
                :invalid="Boolean(fieldErrors.name)"
                @update:model-value="delete fieldErrors.name"
              />
              <p v-if="fieldErrors.name" class="mt-1 text-xs text-red-600">{{ fieldErrors.name }}</p>
            </UiCard>

            <UiCard padding="lg" class="shadow-none">
              <h2 class="border-b border-slate-100 pb-3 text-base font-semibold text-brand-ink">
                Público (segmento)
              </h2>
              <label for="segment-tags" class="mt-4 block text-sm text-brand-ink">Tags (separadas por vírgula)</label>
              <UiInput id="segment-tags" v-model="segmentTags" input-class="mt-1" placeholder="retorno, limpeza" />
              <label
                class="mt-4 flex items-center justify-between gap-4 rounded-lg border border-brand-indigo/20 bg-brand-mist/40 p-3"
              >
                <span class="text-sm font-medium text-brand-ink">Somente contatos com opt-in registrado</span>
                <input v-model="optInOnly" type="checkbox" class="h-4 w-4 rounded text-brand-indigo" />
              </label>
              <p v-if="previewCount != null" class="mt-2 text-sm font-semibold text-brand-indigo">
                Última prévia: {{ previewCount }} contatos
              </p>
            </UiCard>

            <UiCard padding="lg" class="shadow-none">
              <h2 class="border-b border-slate-100 pb-3 text-base font-semibold text-brand-ink">
                Mensagem (template aprovado pela Meta)
              </h2>
              <p class="mt-3 text-xs text-brand-gray">Somente modelos aprovados pela Meta.</p>
              <div class="mt-4 space-y-3">
                <label
                  v-for="template in approvedTemplates"
                  :key="template.id"
                  class="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors"
                  :class="
                    selectedTemplateId === template.id ? 'border-brand-indigo bg-brand-mist/30' : 'border-slate-200'
                  "
                >
                  <input v-model="selectedTemplateId" type="radio" :value="template.id" class="mt-1 shrink-0" />
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-brand-ink">{{ template.name }}</p>
                    <p v-if="templateMetaLine(template)" class="mt-0.5 text-[11px] text-brand-gray">
                      {{ templateMetaLine(template) }}
                    </p>
                    <p v-if="template.body" class="mt-1 line-clamp-2 text-xs text-brand-gray">{{ template.body }}</p>
                  </div>
                </label>
                <p v-if="!approvedTemplates.length" class="text-sm text-brand-gray">
                  Nenhum modelo aprovado. Sincronize ou aguarde aprovação em Campanhas → Modelos de mensagem.
                </p>
              </div>

              <div v-if="selectedVariableIndexes.length" class="mt-5 space-y-3 border-t border-slate-100 pt-4">
                <p class="text-sm font-semibold text-brand-ink">Variáveis do modelo</p>
                <div v-for="(variableIndex, parameterIndex) in selectedVariableIndexes" :key="variableIndex">
                  <label class="block text-xs font-medium text-brand-ink">
                    Valor para <code>{{ formatMetaTemplateVariable(variableIndex) }}</code>
                  </label>
                  <UiInput
                    v-model="templateBodyParameters[parameterIndex]"
                    input-class="mt-1"
                    :placeholder="`Ex.: valor para posição ${variableIndex}`"
                    :invalid="Boolean(fieldErrors[`template_body_parameters.${parameterIndex}`])"
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
            </UiCard>

            <UiCard padding="lg" class="shadow-none">
              <h2 class="border-b border-slate-100 pb-3 text-base font-semibold text-brand-ink">Velocidade de envio</h2>
              <div class="mt-4">
                <CampaignSendRateSelect v-model="sendRate" :error="fieldErrors.send_rate" />
              </div>
            </UiCard>

            <UiCard padding="lg" class="shadow-none">
              <h2 class="border-b border-slate-100 pb-3 text-base font-semibold text-brand-ink">Agendamento</h2>
              <div class="mt-3 flex flex-wrap gap-2">
                <UiFilterChip :active="scheduleMode === 'draft'" @click="setScheduleMode('draft')">
                  Rascunho
                </UiFilterChip>
                <UiFilterChip :active="scheduleMode === 'scheduled'" @click="setScheduleMode('scheduled')">
                  Agendar data
                </UiFilterChip>
              </div>
              <div v-if="scheduleMode === 'scheduled'" class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <input
                    v-model="scheduleDate"
                    type="date"
                    class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-brand-ink focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
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
                    class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-brand-ink focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
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
            </UiCard>
          </div>

          <aside class="lg:col-span-5">
            <UiCard padding="lg" class="sticky top-4 shadow-none">
              <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                <p class="text-sm font-semibold text-brand-ink">Pré-visualização da mensagem</p>
                <span
                  class="rounded bg-brand-mist px-2 py-0.5 text-[10px] font-semibold uppercase text-brand-gray"
                >
                  Tempo real
                </span>
              </div>
              <div class="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-[#efeae2]">
                <div class="bg-[#075e54] px-3 py-2 text-xs font-semibold text-white">WhatsApp — preview</div>
                <div class="p-4">
                  <div
                    class="max-w-[95%] rounded-lg rounded-tl-none bg-white p-3 text-sm leading-relaxed text-slate-800 shadow-sm"
                  >
                    {{ previewBody || 'Selecione um template aprovado.' }}
                  </div>
                </div>
              </div>
              <RouterLink
                :to="{ name: 'campanhas' }"
                class="mt-4 inline-block text-sm font-semibold text-brand-indigo hover:underline"
              >
                Voltar para campanhas
              </RouterLink>
            </UiCard>
          </aside>
        </div>
      </div>

      <AppPageFooter />
    </div>
  </AppPageShell>
</template>
