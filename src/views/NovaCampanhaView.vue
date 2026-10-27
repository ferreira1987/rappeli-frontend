<script setup lang="ts">
import { Loader2 } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import { createCampaign, fetchCampaignSegmentPreview } from '@/api/campaigns'
import { fetchMessageTemplates } from '@/api/messageTemplates'
import AppPageHeader from '@/components/app/AppPageHeader.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import { panelBreadcrumbs } from '@/constants/panelBreadcrumbs'
import type { MessageTemplate } from '@/types/campaigns'
import { getErrorMessage, getValidationErrors } from '@/utils/errors'

const router = useRouter()

const campaignName = ref('')
const optInOnly = ref(true)
const selectedTemplateId = ref<number | null>(null)
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

const selectedTemplate = computed(() =>
  templates.value.find((t) => t.id === selectedTemplateId.value),
)

const previewBody = computed(() => {
  const body = selectedTemplate.value?.body ?? ''
  return body
    .replace(/\{\{nome\}\}/gi, 'Mariana Costa')
    .replace(/\{\{procedimento\}\}/gi, 'limpeza e avaliação preventiva')
    .replace(/\{\{profissional\}\}/gi, 'Dra. Fernanda Lins')
})

async function loadTemplates(): Promise<void> {
  loading.value = true
  try {
    templates.value = await fetchMessageTemplates()
    if (templates.value[0]) {
      selectedTemplateId.value = templates.value[0].id
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

function scheduledAtIso(): string | null {
  if (scheduleMode.value !== 'scheduled' || !scheduleDate.value) return null
  return new Date(`${scheduleDate.value}T${scheduleTime.value}:00`).toISOString()
}

async function saveDraft(): Promise<void> {
  await submit('rascunho')
}

async function scheduleCampaign(): Promise<void> {
  if (scheduleMode.value === 'scheduled') {
    statusMessage.value =
      'Campanha salva como agendada no sistema. Disparo automático via WhatsApp: Em breve.'
    await submit('agendada')
    return
  }
  await saveDraft()
}

async function submit(status: 'rascunho' | 'agendada'): Promise<void> {
  if (!campaignName.value.trim()) {
    fieldErrors.value = { name: 'Informe o nome da campanha.' }
    return
  }
  submitting.value = true
  formError.value = null
  fieldErrors.value = {}
  const tags = segmentTags.value
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
  try {
    const campaign = await createCampaign({
      name: campaignName.value.trim(),
      opt_in_only: optInOnly.value,
      segment_tags: tags.length ? tags : null,
      message_template_id: selectedTemplateId.value,
      status,
      scheduled_at: scheduledAtIso(),
    })
    const preview = await fetchCampaignSegmentPreview(campaign.id)
    previewCount.value = preview.count
    statusMessage.value = `Campanha criada. ${preview.count} contatos no segmento.`
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
    <AppPageHeader
      title="Nova campanha"
      :breadcrumbs="
        panelBreadcrumbs({ label: 'Campanhas', to: { name: 'campanhas' } }, { label: 'Nova campanha' })
      "
    >
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
          {{ scheduleMode === 'scheduled' ? 'Agendar campanha' : 'Criar campanha' }}
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
          <div class="mt-4 space-y-3">
            <label
              v-for="template in templates"
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
            <p v-if="!templates.length" class="text-sm text-brand-gray">Nenhum template na API.</p>
          </div>
        </section>

        <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <h2 class="text-sm font-bold text-brand-ink">4. Agendamento</h2>
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
            <input v-model="scheduleDate" type="date" class="rounded-lg border px-3 py-2 text-sm" />
            <input v-model="scheduleTime" type="time" class="rounded-lg border px-3 py-2 text-sm" />
          </div>
        </section>
      </div>

      <aside class="w-full shrink-0 lg:w-80">
        <div class="sticky top-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <p class="text-xs font-semibold uppercase text-brand-gray">Pré-visualização</p>
          <div class="mt-3 rounded-lg bg-[#e5ddd5] p-3 text-sm">{{ previewBody || 'Selecione um template.' }}</div>
          <p class="mt-4 text-xs text-amber-800">
            Disparo real para a lista segmentada: Em breve (não simulamos envio).
          </p>
          <RouterLink :to="{ name: 'campanhas' }" class="mt-4 inline-block text-sm font-semibold text-brand-indigo">
            Voltar para campanhas
          </RouterLink>
        </div>
      </aside>

      <AppPageFooter class="lg:col-span-2" />
    </div>
  </div>
</template>
