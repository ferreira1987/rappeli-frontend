<script setup lang="ts">
import { Filter, MessageSquarePlus, Paperclip, Search, Send, Smile } from '@lucide/vue'
import { ref } from 'vue'

import ExampleDataBanner from '@/components/app/ExampleDataBanner.vue'

const selectedId = ref<string | null>(null)

const inboxPlaceholders = [
  { id: '1', title: 'Contato exemplo', meta: 'Última mensagem · placeholder' },
  { id: '2', title: 'Contato exemplo 2', meta: 'Última mensagem · placeholder' },
]
</script>

<template>
  <div class="flex h-[calc(100vh)] min-h-0 flex-col bg-white">
    <header class="flex flex-wrap items-center gap-3 border-b border-slate-200 px-5 py-3">
      <h1 class="font-display text-lg font-semibold text-brand-ink">Conversas</h1>
      <ExampleDataBanner class="!py-2 text-xs" message="Layout ilustrativo — mensagens reais virão da API." />
      <button
        type="button"
        disabled
        class="ml-auto inline-flex items-center gap-2 rounded-xl bg-brand-indigo px-4 py-2 text-sm font-semibold text-white opacity-60"
      >
        <MessageSquarePlus class="h-4 w-4" />
        Nova conversa
      </button>
    </header>

    <div class="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[320px_1fr_300px]">
      <!-- Inbox -->
      <section class="flex min-h-0 flex-col border-r border-slate-200">
        <div class="border-b border-slate-100 p-4">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-semibold text-brand-ink">Caixa de entrada</h2>
            <span class="rounded-full bg-brand-mist px-2 py-0.5 text-[10px] font-semibold text-brand-indigo">—</span>
          </div>
          <div class="relative mt-3">
            <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray" />
            <input
              disabled
              placeholder="Buscar por cliente, telefone ou assunto…"
              class="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm"
            />
          </div>
          <div class="mt-3 flex flex-wrap gap-2">
            <span class="rounded-full bg-brand-indigo px-3 py-1 text-xs font-medium text-white">Todas</span>
            <span class="rounded-full bg-slate-100 px-3 py-1 text-xs text-brand-gray">Não lidas</span>
            <span class="rounded-full bg-slate-100 px-3 py-1 text-xs text-brand-gray">Automáticas</span>
          </div>
        </div>
        <ul class="min-h-0 flex-1 overflow-y-auto p-2">
          <li v-for="item in inboxPlaceholders" :key="item.id">
            <button
              type="button"
              class="mb-1 w-full rounded-xl p-3 text-left transition"
              :class="selectedId === item.id ? 'bg-brand-mist' : 'hover:bg-slate-50'"
              @click="selectedId = item.id"
            >
              <p class="text-sm font-semibold text-brand-ink">{{ item.title }}</p>
              <p class="mt-1 text-xs text-brand-gray">{{ item.meta }}</p>
              <p class="mt-2 line-clamp-2 text-xs text-brand-gray">Prévia da mensagem — aguardando API.</p>
            </button>
          </li>
        </ul>
      </section>

      <!-- Chat -->
      <section class="flex min-h-0 flex-col border-r border-slate-200">
        <div class="border-b border-slate-100 px-4 py-3">
          <p class="font-semibold text-brand-ink">
            {{ selectedId ? 'Contato exemplo' : 'Selecione uma conversa' }}
          </p>
          <p class="text-xs text-brand-gray">Canal WhatsApp — status via integração</p>
        </div>
        <div class="flex flex-1 flex-col items-center justify-center gap-2 bg-slate-50/50 p-6 text-center text-sm text-brand-gray">
          <template v-if="!selectedId">
            <p>Nenhuma conversa selecionada.</p>
          </template>
          <template v-else>
            <p>Histórico de mensagens vazio.</p>
            <p class="text-xs">As mensagens aparecerão aqui após conectar o WhatsApp e a API de conversas.</p>
          </template>
        </div>
        <div class="border-t border-slate-100 p-4">
          <div class="flex gap-2">
            <button type="button" class="rounded-lg p-2 text-brand-gray" disabled aria-label="Anexo">
              <Paperclip class="h-5 w-5" />
            </button>
            <input
              disabled
              placeholder="Digite sua mensagem…"
              class="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <button type="button" class="rounded-lg p-2 text-brand-gray" disabled aria-label="Emoji">
              <Smile class="h-5 w-5" />
            </button>
            <button type="button" class="rounded-xl bg-brand-indigo p-2 text-white opacity-60" disabled aria-label="Enviar">
              <Send class="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      <!-- Details -->
      <section class="hidden min-h-0 flex-col p-4 lg:flex">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-semibold text-brand-ink">Detalhes do contato</h2>
          <button type="button" class="text-xs text-brand-gray" disabled>
            <Filter class="inline h-3.5 w-3.5" />
          </button>
        </div>
        <div class="mt-6 flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-brand-gray">
          Dados do contato e o histórico serão exibidos quando houver integração com a API.
        </div>
      </section>
    </div>
  </div>
</template>
