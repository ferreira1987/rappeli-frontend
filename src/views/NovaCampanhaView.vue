<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

import AppPageHeader from '@/components/app/AppPageHeader.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import { exampleMetaTemplates } from '@/services/example'

const campaignName = ref('Lembrete de retorno - Pacientes 6 meses')
const optInOnly = ref(true)
const selectedTemplateId = ref('t1')
const scheduleMode = ref<'now' | 'scheduled'>('scheduled')
const scheduleDate = ref('2026-10-28')
const scheduleTime = ref('14:30')
const sendRate = ref('default')

const selectedTemplate = computed(() =>
  exampleMetaTemplates.find((t) => t.id === selectedTemplateId.value),
)

const previewBody = computed(() => {
  const body = selectedTemplate.value?.body ?? ''
  return body
    .replace('{{1}}', 'Mariana Costa')
    .replace('{{2}}', 'limpeza e avaliação preventiva')
    .replace('{{3}}', 'Dra. Fernanda Lins')
})
</script>

<template>
  <div class="flex min-h-full flex-col bg-brand-mist">
    <AppPageHeader
      title="Nova campanha"
      :breadcrumbs="[
        { label: 'Painel', to: '/painel' },
        { label: 'Campanhas', to: '/campanhas' },
        { label: 'Nova campanha' },
      ]"
      show-example-badge
    >
      <template #actions>
        <button type="button" class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold">
          Salvar rascunho
        </button>
        <button type="button" class="rounded-lg bg-brand-indigo px-4 py-2 text-sm font-semibold text-white">
          Agendar campanha
        </button>
      </template>
    </AppPageHeader>

    <div class="flex flex-1 flex-col gap-6 px-4 py-6 lg:flex-row lg:px-8">
      <div class="min-w-0 flex-1 space-y-4">
        <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <h2 class="text-sm font-bold text-brand-ink">1. Informações da campanha</h2>
          <p class="text-xs text-brand-gray">Identifique a campanha para controle e relatórios internos</p>
          <label class="mt-4 block text-sm font-medium text-brand-ink">Nome da campanha *</label>
          <div class="relative mt-1">
            <input v-model="campaignName" type="text" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <span class="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-brand-gray">
              Exemplo
            </span>
          </div>
          <p class="mt-1 text-xs text-brand-gray">Este nome é visível apenas para a sua equipe no painel.</p>
        </section>

        <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <h2 class="text-sm font-bold text-brand-ink">2. Público (segmento)</h2>
          <p class="text-xs text-brand-gray">Filtre os contatos que receberão esta mensagem automatizada</p>
          <div class="mt-4 space-y-3 text-sm">
            <div class="flex flex-wrap gap-2">
              <span class="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-xs">Retorno 6 meses</span>
              <span class="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-xs">Limpeza</span>
              <button type="button" class="text-xs font-semibold text-brand-indigo">+ Adicionar tag</button>
            </div>
            <label class="flex items-center justify-between gap-4 rounded-lg border border-brand-indigo/20 bg-brand-mist/40 p-3">
              <span class="text-sm font-medium text-brand-ink">Somente contatos com opt-in registrado</span>
              <input v-model="optInOnly" type="checkbox" class="h-4 w-4 rounded text-brand-indigo" />
            </label>
            <p class="text-[11px] text-brand-gray">Obrigatório para conformidade com a Meta WhatsApp API</p>
            <div class="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">
              CONTATOS NO SEGMENTO 214 (exemplo)
            </div>
          </div>
        </section>

        <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div class="flex items-center gap-2 text-xs text-emerald-700">
            <span class="h-2 w-2 rounded-full bg-emerald-500" />
            Sincronizado com WhatsApp Cloud API
          </div>
          <h2 class="mt-2 text-sm font-bold text-brand-ink">3. Mensagem (Template oficial da Meta)</h2>
          <div class="mt-4 space-y-3">
            <label
              v-for="template in exampleMetaTemplates"
              :key="template.id"
              class="block cursor-pointer rounded-xl border p-4 transition"
              :class="
                selectedTemplateId === template.id
                  ? 'border-brand-indigo ring-1 ring-brand-indigo/30'
                  : 'border-slate-200 hover:border-slate-300'
              "
            >
              <input v-model="selectedTemplateId" type="radio" class="sr-only" :value="template.id" />
              <div class="flex flex-wrap items-center gap-2">
                <span class="font-semibold text-brand-ink">{{ template.name }}</span>
                <span class="rounded bg-slate-100 px-1.5 py-0.5 text-[10px]">{{ template.category }}</span>
                <span class="rounded bg-slate-100 px-1.5 py-0.5 text-[10px]">{{ template.locale }}</span>
                <span v-if="template.approved" class="text-[10px] font-semibold text-emerald-700">✓ Aprovado</span>
              </div>
              <p class="mt-2 text-xs text-brand-gray">{{ template.body }}</p>
            </label>
          </div>
        </section>

        <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <h2 class="text-sm font-bold text-brand-ink">4. Agendamento de envio</h2>
          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              class="rounded-xl border p-4 text-left text-sm"
              :class="scheduleMode === 'now' ? 'border-brand-indigo bg-brand-mist/40' : 'border-slate-200'"
              @click="scheduleMode = 'now'"
            >
              Enviar agora
            </button>
            <button
              type="button"
              class="rounded-xl border p-4 text-left text-sm font-semibold"
              :class="scheduleMode === 'scheduled' ? 'border-brand-indigo bg-brand-mist/40' : 'border-slate-200'"
              @click="scheduleMode = 'scheduled'"
            >
              Agendar data e hora
            </button>
          </div>
          <div v-if="scheduleMode === 'scheduled'" class="mt-4 grid gap-3 sm:grid-cols-3">
            <input v-model="scheduleDate" type="date" class="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <input v-model="scheduleTime" type="time" class="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <select v-model="sendRate" class="rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option value="default">Padrão (1 msg a cada 2 seg…)</option>
            </select>
          </div>
        </section>

        <AppPageFooter />
      </div>

      <aside class="w-full shrink-0 space-y-4 lg:w-80">
        <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <h3 class="text-sm font-bold text-brand-ink">Pré-visualização do WhatsApp</h3>
          <div class="mt-3 rounded-2xl border border-slate-200 bg-[#e5ddd5] p-3">
            <p class="mb-2 text-center text-[10px] font-semibold text-brand-gray">Rappeli Odonto &amp; Estética</p>
            <div class="rounded-lg bg-white p-3 text-xs text-brand-ink shadow-xs">
              {{ previewBody }}
              <button type="button" class="mt-3 w-full rounded-lg border border-blue-300 py-1.5 text-xs font-semibold text-blue-700">
                Confirmar consulta
              </button>
            </div>
          </div>
          <p class="mt-2 text-[10px] text-brand-gray">Destinatário de exemplo: Mariana Costa (+55 62 98124-3310)</p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-4 text-xs shadow-xs">
          <h3 class="font-bold text-brand-ink">Resumo do disparo</h3>
          <ul class="mt-2 space-y-1 text-brand-gray">
            <li>Segmento: <strong class="text-brand-ink">Tags: Retorno + Limpeza</strong></li>
            <li>Contatos elegíveis: <strong class="text-brand-indigo">214 contatos</strong></li>
            <li>Template Meta: <strong class="text-brand-ink">{{ selectedTemplate?.name }}</strong></li>
            <li>Programação: <strong class="text-brand-ink">28/10/2026 às 14:30</strong></li>
          </ul>
        </div>
        <div class="rounded-lg border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-900">
          Fora da janela de 24h é obrigatório template aprovado. Campanhas de marketing exigem opt-in registrado.
        </div>
        <RouterLink :to="{ name: 'campanhas' }" class="text-sm font-semibold text-brand-indigo hover:underline">
          ← Voltar para campanhas
        </RouterLink>
      </aside>
    </div>
  </div>
</template>
