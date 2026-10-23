<script setup lang="ts">
import { Bell, CircleHelp, CreditCard, Users } from '@lucide/vue'
import { ref } from 'vue'

import ExampleDataBanner from '@/components/app/ExampleDataBanner.vue'
import WhatsAppSettingsPanel from '@/components/whatsapp/WhatsAppSettingsPanel.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const tabs = ['Empresa', 'Equipe', 'Plano e cobrança', 'WhatsApp'] as const
const activeTab = ref<(typeof tabs)[number]>('Plano e cobrança')
</script>

<template>
  <div class="min-h-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="font-display text-2xl font-semibold text-brand-ink">Configurações</h1>
        <p class="mt-1 text-sm text-brand-gray">
          Gerencie sua conta, equipe, dados fiscais e cobrança.
        </p>
      </div>
      <div class="flex gap-2">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-brand-gray"
          disabled
        >
          <CircleHelp class="h-4 w-4" />
          Suporte
        </button>
        <button type="button" class="rounded-xl border border-slate-200 bg-white p-2 text-brand-gray" disabled aria-label="Notificações">
          <Bell class="h-4 w-4" />
        </button>
      </div>
    </header>

    <nav class="-mx-4 mt-6 flex gap-4 overflow-x-auto border-b border-slate-200 px-4 text-sm font-medium sm:mx-0 sm:gap-6 sm:px-0">
      <button
        v-for="tab in tabs"
        :key="tab"
        type="button"
        class="-mb-px shrink-0 whitespace-nowrap border-b-2 pb-3 transition"
        :class="
          activeTab === tab
            ? 'border-brand-indigo text-brand-indigo'
            : 'border-transparent text-brand-gray hover:text-brand-ink'
        "
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </nav>

    <div class="mt-6 space-y-6">
      <ExampleDataBanner />

      <template v-if="activeTab === 'Plano e cobrança'">
        <div class="grid gap-6 lg:grid-cols-3">
          <section class="space-y-4 lg:col-span-2">
            <article class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div class="flex items-center justify-between gap-2">
                <p class="text-xs font-semibold uppercase tracking-wide text-brand-gray">Assinatura atual</p>
                <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-brand-gray">Sem plano</span>
              </div>
              <h2 class="mt-2 font-display text-xl font-semibold text-brand-ink">Plano não configurado</h2>
              <p class="mt-2 font-display text-2xl font-semibold text-brand-indigo">R$ — <span class="text-sm font-normal text-brand-gray">/mês</span></p>
              <ul class="mt-6 grid gap-2 sm:grid-cols-2 text-sm text-brand-gray">
                <li>Limites e recursos: —</li>
                <li>Próxima cobrança: —</li>
              </ul>
              <button type="button" class="mt-6 rounded-xl border border-brand-indigo/40 px-4 py-2 text-sm font-medium text-brand-indigo" disabled>
                Mudar plano
              </button>
            </article>

            <article class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 class="font-display text-lg font-semibold text-brand-ink">Histórico de faturas</h2>
              <p class="mt-8 text-center text-sm text-brand-gray">Nenhuma fatura disponível.</p>
            </article>
          </section>

          <aside class="space-y-4">
            <article class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-wide text-brand-gray">Método de cobrança</p>
              <div class="mt-4 flex h-36 flex-col justify-between rounded-xl bg-gradient-to-br from-brand-ink to-brand-indigo p-4 text-white">
                <CreditCard class="h-6 w-6 opacity-80" />
                <p class="font-mono text-sm tracking-widest">•••• •••• •••• ——</p>
                <p class="text-xs text-white/70">Cartão não cadastrado</p>
              </div>
              <button type="button" class="mt-4 w-full rounded-xl border border-slate-200 py-2 text-sm text-brand-gray" disabled>
                Trocar cartão
              </button>
            </article>

            <article class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <div class="flex items-center justify-between">
                <h2 class="font-display text-sm font-semibold text-brand-ink">Equipe</h2>
                <Users class="h-4 w-4 text-brand-gray" />
              </div>
              <p class="mt-4 text-sm text-brand-gray">Convites e papéis serão gerenciados aqui.</p>
              <div class="mt-4 rounded-xl bg-brand-mist/50 p-3">
                <p class="text-sm font-medium text-brand-ink">{{ auth.user?.name ?? 'Você' }}</p>
                <p class="text-xs text-brand-gray">{{ auth.user?.email }}</p>
              </div>
            </article>

            <article class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <h2 class="font-display text-sm font-semibold text-brand-ink">Dados da empresa</h2>
              <dl class="mt-4 space-y-2 text-sm">
                <div class="flex justify-between gap-2">
                  <dt class="text-brand-gray">Razão social</dt>
                  <dd class="text-brand-ink">—</dd>
                </div>
                <div class="flex justify-between gap-2">
                  <dt class="text-brand-gray">CNPJ</dt>
                  <dd class="text-brand-ink">—</dd>
                </div>
                <div class="flex justify-between gap-2">
                  <dt class="text-brand-gray">Segmento</dt>
                  <dd class="text-brand-ink">—</dd>
                </div>
              </dl>
            </article>
          </aside>
        </div>
      </template>

      <template v-else-if="activeTab === 'WhatsApp'">
        <WhatsAppSettingsPanel />
      </template>

      <template v-else>
        <section class="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
          <p class="font-display text-lg font-semibold text-brand-ink">{{ activeTab }}</p>
          <p class="mt-2 text-sm text-brand-gray">Seção em construção — formulários virão em fases futuras.</p>
        </section>
      </template>

      <AppPageFooter />
    </div>
  </div>
</template>
