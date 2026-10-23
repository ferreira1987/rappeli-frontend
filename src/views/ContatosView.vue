<script setup lang="ts">
import { Download, Plus, Search, Upload } from '@lucide/vue'

import ExampleDataBanner from '@/components/app/ExampleDataBanner.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'

const segments = ['Todos', 'Clientes ativos', 'Aguardando resposta', 'Confirmação pendente'] as const

const tableRows = Array.from({ length: 5 }, (_, i) => ({
  id: i + 1,
  name: `Contato exemplo ${i + 1}`,
  email: 'email@exemplo.invalid',
}))
</script>

<template>
  <div class="min-h-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
    <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="font-display text-2xl font-semibold text-brand-ink">Contatos</h1>
        <span class="mt-1 inline-block rounded-full bg-brand-mist px-2.5 py-0.5 text-xs font-medium text-brand-indigo">
          Listagem de exemplo
        </span>
      </div>
      <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
        <button
          type="button"
          disabled
          class="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-indigo/30 bg-white px-4 py-2 text-sm font-medium text-brand-indigo sm:w-auto"
        >
          <Upload class="h-4 w-4" />
          Importar CSV
        </button>
        <button
          type="button"
          disabled
          class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-indigo px-4 py-2 text-sm font-semibold text-white opacity-60 sm:w-auto"
        >
          <Plus class="h-4 w-4" />
          Novo contato
        </button>
      </div>
    </header>

    <div class="mt-6 grid min-w-0 gap-6 lg:grid-cols-[240px_1fr]">
      <aside class="space-y-4">
        <section class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <h2 class="text-sm font-semibold text-brand-ink">Segmentos</h2>
          <ul class="mt-3 space-y-1">
            <li v-for="(seg, idx) in segments" :key="seg">
              <button
                type="button"
                class="flex w-full items-center justify-between rounded-lg px-2 py-2 text-sm"
                :class="idx === 0 ? 'bg-brand-mist font-medium text-brand-indigo' : 'text-brand-gray'"
                disabled
              >
                {{ seg }}
                <span class="text-xs text-brand-gray">—</span>
              </button>
            </li>
          </ul>
        </section>
        <section class="rounded-2xl bg-gradient-to-br from-brand-ink to-brand-indigo p-4 text-white">
          <p class="text-xs font-semibold uppercase tracking-wide text-brand-coral">Dica</p>
          <p class="mt-2 font-display text-sm font-semibold">Lembretes automáticos</p>
          <p class="mt-2 text-xs text-white/80">Configure avisos e confirmações quando a API de automações estiver ativa.</p>
          <button type="button" class="mt-4 w-full rounded-xl bg-brand-coral py-2 text-xs font-semibold" disabled>
            Criar automação
          </button>
        </section>
      </aside>

      <div class="space-y-4">
        <ExampleDataBanner message="Tabela ilustrativa — nomes e e-mails são placeholders (@exemplo.invalid)." />

        <div class="flex flex-wrap gap-2">
          <div class="relative min-w-[200px] flex-1">
            <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray" />
            <input
              disabled
              placeholder="Buscar contatos…"
              class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm"
            />
          </div>
          <button type="button" disabled class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-brand-gray">
            Tag: todas
          </button>
          <button type="button" disabled class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-brand-gray">
            <Download class="h-4 w-4" />
            Exportar
          </button>
        </div>

        <div class="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <table class="w-full min-w-[640px] text-left text-sm">
            <thead class="border-b border-slate-100 bg-slate-50/80 text-xs uppercase tracking-wide text-brand-gray">
              <tr>
                <th class="px-4 py-3 font-medium">Nome</th>
                <th class="px-4 py-3 font-medium">WhatsApp</th>
                <th class="px-4 py-3 font-medium">Tags</th>
                <th class="px-4 py-3 font-medium">Última interação</th>
                <th class="px-4 py-3 font-medium">Opt-in</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in tableRows" :key="row.id" class="border-b border-slate-50 last:border-0">
                <td class="px-4 py-3">
                  <p class="font-medium text-brand-ink">{{ row.name }}</p>
                  <p class="text-xs text-brand-gray">{{ row.email }}</p>
                </td>
                <td class="px-4 py-3 text-brand-gray">(00) 00000-0000</td>
                <td class="px-4 py-3">
                  <span class="rounded-full bg-brand-mist px-2 py-0.5 text-xs text-brand-indigo">—</span>
                </td>
                <td class="px-4 py-3 text-brand-gray">—</td>
                <td class="px-4 py-3 text-brand-gray">—</td>
              </tr>
            </tbody>
          </table>
          <p class="border-t border-slate-100 px-4 py-3 text-xs text-brand-gray">
            Nenhum contato real carregado — aguardando API.
          </p>
        </div>

        <AppPageFooter />
      </div>
    </div>
  </div>
</template>
