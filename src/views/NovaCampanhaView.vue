<script setup lang="ts">
import { CalendarClock, ChevronDown, ExternalLink, Loader2, ShieldCheck } from '@lucide/vue'
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import {
  createCampaign,
  fetchCampaign,
  fetchCampaignSegmentPreview,
  updateCampaign,
} from '@/api/campaigns'
import { fetchMessageTemplatesList, syncMessageTemplates } from '@/api/messageTemplates'
import CampaignSendRateSelect from '@/components/campaigns/CampaignSendRateSelect.vue'
import CampaignWhatsAppPreview from '@/components/campaigns/CampaignWhatsAppPreview.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import AppPageShell from '@/components/layout/AppPageShell.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiInput from '@/components/ui/UiInput.vue'
import { panelBreadcrumbs } from '@/constants/panelBreadcrumbs'
import { useWhatsAppStore } from '@/stores/whatsapp'
import type { CampaignStatus } from '@/types/campaigns'
import type { MessageTemplate } from '@/types/messageTemplates'
import {
  campaignSendRatePayloadValue,
  estimateCampaignSendDurationMinutes,
  normalizeCampaignSendRateForForm,
} from '@/utils/campaignSendRate'
import { getErrorMessage, getValidationErrors } from '@/utils/errors'
import {
  messageTemplateCategoryLabel,
  messageTemplateStatusLabel,
} from '@/utils/messageTemplateLabels'
import {
  applyTemplateBodyParameters,
  formatMetaTemplateVariable,
  isMessageTemplateApproved,
  resolveTemplateVariableIndexes,
} from '@/utils/messageTemplatePreview'
import { formatBrazilPhone } from '@/utils/phone'
import { pluralWordPt } from '@/utils/pluralize'

const router = useRouter()
const route = useRoute()
const whatsappStore = useWhatsAppStore()

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
const scheduleDateTime = ref('')
const segmentTags = ref('')
const loading = ref(true)
const submitting = ref(false)
const syncingTemplates = ref(false)
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

const templateMetaLocaleLabel = computed(() => formatTemplateLocale(selectedTemplate.value?.locale))

function categoryLabel(category: string | null | undefined): string | null {
  const label = messageTemplateCategoryLabel(category)
  return label === '—' ? null : label
}

const templateMetaCategoryLabel = computed(() => categoryLabel(selectedTemplate.value?.category))

const showTemplateMetaBar = computed(
  () => Boolean(selectedTemplate.value) && (templateMetaLocaleLabel.value || templateMetaCategoryLabel.value),
)

const formattedWhatsappPhone = computed(() => {
  const phone = whatsappStore.displayPhoneNumber
  return phone ? formatBrazilPhone(phone) || phone : null
})

const showMetaConnectionNote = computed(
  () => whatsappStore.hydrated && whatsappStore.connected && Boolean(formattedWhatsappPhone.value),
)

const estimatedDurationMinutes = computed(() => {
  if (previewCount.value == null) return null
  return estimateCampaignSendDurationMinutes(previewCount.value, sendRate.value)
})

const estimatedDispatchLabel = computed(() => {
  if (previewCount.value == null) return null
  return `${previewCount.value.toLocaleString('pt-BR')} ${pluralWordPt(previewCount.value, 'mensagem')}`
})

const estimatedDurationLabel = computed(() => {
  if (estimatedDurationMinutes.value == null) return null
  return `~${estimatedDurationMinutes.value.toLocaleString('pt-BR')} minutos`
})

const showOperationSummary = computed(
  () => estimatedDispatchLabel.value != null || estimatedDurationLabel.value != null,
)

function formatTemplateLocale(locale: string | null | undefined): string | null {
  if (!locale?.trim()) return null
  const normalized = locale.trim().replace('-', '_')
  if (normalized.toLowerCase() === 'pt_br') {
    return 'Português (Brasil)'
  }
  return locale
}

function templateOptionLabel(template: MessageTemplate): string {
  const category = messageTemplateCategoryLabel(template.category)
  const status = messageTemplateStatusLabel(template.status)
  return `${template.name} (${category} • ${status} pela Meta)`
}

function syncTemplateBodyParametersFromSelection(): void {
  const indexes = selectedVariableIndexes.value
  const previous = templateBodyParameters.value
  templateBodyParameters.value = indexes.map((_, index) => previous[index] ?? '')
}

function applyScheduleFromIso(iso: string | null): void {
  if (!iso) {
    scheduleDateTime.value = ''
    return
  }
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    scheduleDateTime.value = ''
    return
  }
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  scheduleDateTime.value = `${date.getFullYear()}-${month}-${day}T${hours}:${minutes}`
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
    applyScheduleFromIso(campaign.scheduled_at)
  } else {
    scheduleMode.value = campaign.status === 'agendada' ? 'scheduled' : 'draft'
    scheduleDateTime.value = ''
  }
}

async function loadSegmentPreview(): Promise<void> {
  if (campaignId.value == null) return
  try {
    const preview = await fetchCampaignSegmentPreview(campaignId.value)
    previewCount.value = preview.count
  } catch {
    previewCount.value = null
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
        await loadSegmentPreview()
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
  if (!whatsappStore.hydrated) {
    void whatsappStore.refresh()
  }
  void loadTemplates()
})

watch(selectedTemplateId, () => {
  syncTemplateBodyParametersFromSelection()
})

function validateScheduleFields(): boolean {
  fieldErrors.value = {}
  const errors: Record<string, string> = {}
  if (!scheduleDateTime.value.trim()) {
    errors.scheduled_date = 'Informe a data do agendamento.'
    errors.scheduled_time = 'Informe o horário do agendamento.'
  } else {
    const scheduled = new Date(scheduleDateTime.value)
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
    scheduled_at:
      status === 'agendada' && scheduleDateTime.value.trim()
        ? new Date(scheduleDateTime.value).toISOString()
        : null,
    send_rate: campaignSendRatePayloadValue(sendRate.value),
  }
}

async function saveDraft(): Promise<void> {
  await submit('rascunho')
}

async function scheduleCampaign(): Promise<void> {
  if (scheduleDateTime.value.trim()) {
    scheduleMode.value = 'scheduled'
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

async function onSyncTemplates(): Promise<void> {
  syncingTemplates.value = true
  formError.value = null
  try {
    const result = await syncMessageTemplates()
    templates.value = result.templates
    if (!selectedTemplateId.value) {
      const firstApproved = templates.value.find((template) => isMessageTemplateApproved(template))
      if (firstApproved) {
        selectedTemplateId.value = firstApproved.id
      }
    }
  } catch (err) {
    formError.value = getErrorMessage(err)
  } finally {
    syncingTemplates.value = false
  }
}

const primaryActionLabel = computed(() => {
  if (scheduleDateTime.value.trim()) {
    return 'Agendar envio'
  }
  if (isEditMode.value) {
    return 'Salvar campanha'
  }
  return 'Criar campanha'
})
</script>

<template>
  <AppPageShell :title="pageTitle" :breadcrumbs="breadcrumbs">
    <template #actions>
      <RouterLink :to="{ name: 'campanhas' }" class="inline-flex">
        <UiButton variant="secondary" size="sm" :disabled="submitting">Cancelar</UiButton>
      </RouterLink>
      <UiButton variant="secondary" size="sm" :disabled="submitting" @click="saveDraft">
        Salvar rascunho
      </UiButton>
      <UiButton size="sm" class="gap-1.5" :disabled="submitting" @click="scheduleCampaign">
        <CalendarClock class="h-4 w-4" aria-hidden="true" />
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
          <UiCard padding="lg" class="shadow-none lg:col-span-7">
            <template #header>
              <h2 class="text-sm font-semibold text-brand-ink">Detalhes da campanha</h2>
              <p class="mt-0.5 text-xs text-brand-gray">
                Configure o disparo pontual ou em lote para a sua base de clientes.
              </p>
            </template>

            <div class="space-y-4">
              <div>
                <label for="campaign-name" class="mb-1 block text-xs font-medium text-brand-ink">
                  Nome da campanha <span class="text-red-500">*</span>
                </label>
                <UiInput
                  id="campaign-name"
                  v-model="campaignName"
                  placeholder="Ex: Confirmação de aula, Reativação de clientes"
                  :invalid="Boolean(fieldErrors.name)"
                  @update:model-value="delete fieldErrors.name"
                />
                <p class="mt-1 text-[11px] text-brand-gray">
                  Identificação interna visível apenas para os atendentes.
                </p>
                <p v-if="fieldErrors.name" class="mt-1 text-xs text-red-600">{{ fieldErrors.name }}</p>
              </div>

              <div>
                <div class="mb-1 flex items-center justify-between gap-2">
                  <label for="campaign-template" class="text-xs font-medium text-brand-ink">
                    Modelo de mensagem <span class="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 text-[11px] font-medium text-brand-indigo hover:underline disabled:opacity-50"
                    :disabled="syncingTemplates"
                    @click="onSyncTemplates"
                  >
                    <ExternalLink class="h-3.5 w-3.5" aria-hidden="true" />
                    Sincronizar templates Meta
                  </button>
                </div>
                <div class="relative">
                  <select
                    id="campaign-template"
                    v-model="selectedTemplateId"
                    class="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-8 text-xs text-brand-ink focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
                  >
                    <option v-if="!approvedTemplates.length" :value="null" disabled>
                      Nenhum modelo aprovado disponível
                    </option>
                    <option v-for="template in approvedTemplates" :key="template.id" :value="template.id">
                      {{ templateOptionLabel(template) }}
                    </option>
                  </select>
                  <ChevronDown
                    class="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray"
                    aria-hidden="true"
                  />
                </div>
                <p class="mt-2 text-xs text-brand-gray">Somente modelos aprovados pela Meta.</p>
                <p v-if="!approvedTemplates.length" class="mt-1 text-xs text-brand-gray">
                  Nenhum modelo aprovado. Sincronize ou aguarde aprovação em Campanhas → Modelos de mensagem.
                </p>

                <div
                  v-if="showTemplateMetaBar"
                  class="mt-2 flex items-center justify-between rounded-lg border border-slate-200 bg-brand-surface p-2.5"
                >
                  <div class="flex items-center gap-2 text-[11px] font-medium text-slate-600">
                    <span class="h-2 w-2 rounded-full bg-emerald-600" aria-hidden="true" />
                    <span v-if="templateMetaLocaleLabel && templateMetaCategoryLabel">
                      Idioma: {{ templateMetaLocaleLabel }} • Categoria: {{ templateMetaCategoryLabel }}
                    </span>
                    <span v-else-if="templateMetaLocaleLabel">Idioma: {{ templateMetaLocaleLabel }}</span>
                    <span v-else-if="templateMetaCategoryLabel">Categoria: {{ templateMetaCategoryLabel }}</span>
                  </div>
                  <UiBadge variant="success" size="md">Ativo</UiBadge>
                </div>
              </div>

              <div v-if="selectedVariableIndexes.length" class="space-y-3 rounded-lg border border-slate-100 bg-brand-surface/60 p-3">
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

              <div>
                <p class="mb-1 text-xs font-medium text-brand-ink">
                  Público e contatos destinatários <span class="text-red-500">*</span>
                </p>
                <label for="segment-tags" class="mb-1 block text-xs text-brand-gray">
                  Tags (separadas por vírgula)
                </label>
                <UiInput
                  id="segment-tags"
                  v-model="segmentTags"
                  placeholder="retorno, limpeza"
                />
                <label
                  class="mt-3 flex items-center justify-between gap-4 rounded-lg border border-brand-indigo/20 bg-brand-mist/40 p-3"
                >
                  <span class="text-sm font-medium text-brand-ink">Somente contatos com opt-in registrado</span>
                  <input v-model="optInOnly" type="checkbox" class="h-4 w-4 rounded text-brand-indigo" />
                </label>
                <p v-if="previewCount != null" class="mt-2 text-[11px] text-brand-gray">
                  Destinatários válidos calculados:
                  <strong class="text-brand-ink">{{ previewCount.toLocaleString('pt-BR') }} telefones</strong>
                </p>
                <p v-if="previewCount != null" class="mt-2 text-sm font-semibold text-brand-indigo">
                  Última prévia: {{ previewCount }} contatos
                </p>
              </div>

              <div class="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div>
                  <label for="schedule-datetime" class="mb-1 block text-xs font-medium text-brand-ink">
                    Agendar para <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="schedule-datetime"
                    v-model="scheduleDateTime"
                    type="datetime-local"
                    class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-brand-ink focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
                    @input="delete fieldErrors.scheduled_date"
                  />
                  <p class="mt-1 text-[11px] text-brand-gray">Horário de Brasília (GMT-3).</p>
                  <p v-if="fieldErrors.scheduled_date" class="mt-1 text-xs text-red-600">
                    {{ fieldErrors.scheduled_date }}
                  </p>
                  <p v-if="fieldErrors.scheduled_time" class="mt-1 text-xs text-red-600">
                    {{ fieldErrors.scheduled_time }}
                  </p>
                  <p v-if="fieldErrors.scheduled_at" class="mt-1 text-xs text-red-600">
                    {{ fieldErrors.scheduled_at }}
                  </p>
                </div>

                <div>
                  <CampaignSendRateSelect
                    v-model="sendRate"
                    input-id="campaign-send-rate"
                    label="Taxa de envio (velocidade)"
                    help-text="Proteção nativa contra bloqueios da Meta."
                    :error="fieldErrors.send_rate"
                  />
                </div>
              </div>

              <div
                v-if="showMetaConnectionNote"
                class="flex items-start gap-2.5 rounded-lg border border-indigo-200 bg-brand-mist p-3"
              >
                <ShieldCheck class="mt-0.5 h-4 w-4 shrink-0 text-brand-indigo" aria-hidden="true" />
                <p class="text-[11px] leading-relaxed text-indigo-950">
                  <strong>Conexão Cloud API Oficial Meta:</strong>
                  As mensagens serão despachadas através do número homologado
                  <strong>{{ formattedWhatsappPhone }}</strong>
                  com taxa de entrega garantida e selo verificado.
                </p>
              </div>
            </div>
          </UiCard>

          <aside class="space-y-4 lg:col-span-5">
            <CampaignWhatsAppPreview
              :body-text="previewBody"
              :template="selectedTemplate"
              :verified-name="whatsappStore.account?.verified_name"
              :display-phone="whatsappStore.displayPhoneNumber"
            />

            <UiCard v-if="showOperationSummary" padding="md" class="shadow-none">
              <h4 class="mb-2.5 text-xs font-semibold text-brand-ink">Resumo da operação</h4>
              <dl class="space-y-2 text-xs">
                <div v-if="estimatedDispatchLabel" class="flex justify-between gap-3 text-brand-gray">
                  <dt>Total estimado de disparos:</dt>
                  <dd class="font-medium text-brand-ink">{{ estimatedDispatchLabel }}</dd>
                </div>
                <div v-if="estimatedDurationLabel" class="flex justify-between gap-3 text-brand-gray">
                  <dt>Duração estimada do envio:</dt>
                  <dd class="font-medium text-brand-ink">{{ estimatedDurationLabel }}</dd>
                </div>
              </dl>
            </UiCard>
          </aside>
        </div>
      </div>

      <AppPageFooter />
    </div>
  </AppPageShell>
</template>
