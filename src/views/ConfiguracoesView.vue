<script setup lang="ts">
import { Bell, CircleHelp, Users } from '@lucide/vue'
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import WhatsAppSettingsPanel from '@/components/whatsapp/WhatsAppSettingsPanel.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const tabs = ['Empresa', 'Equipe', 'Plano e cobrança', 'WhatsApp'] as const
const activeTab = ref<(typeof tabs)[number]>('Plano e cobrança')

watch(
  () => route.query.tab,
  (tab) => {
    if (tab === 'whatsapp' || tab === 'WhatsApp') {
      activeTab.value = 'WhatsApp'
    }
  },
  { immediate: true },
)

function selectTab(tab: (typeof tabs)[number]): void {
  activeTab.value = tab
  if (tab === 'WhatsApp') {
    void router.replace({ query: { ...route.query, tab: 'whatsapp' } })
  } else {
    const query = { ...route.query }
    delete query.tab
    void router.replace({ query })
  }
}
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

    <nav
      class="scrollbar-none -mx-4 mt-6 flex gap-4 overflow-x-auto border-b border-slate-200 px-4 text-sm font-medium sm:mx-0 sm:gap-6 sm:px-0"
    >
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
        @click="selectTab(tab)"
      >
        {{ tab }}
      </button>
    </nav>

    <div class="mt-6 space-y-6">
      <template v-if="activeTab === 'Plano e cobrança'">
        <div class="grid gap-6 lg:grid-cols-3">
          <section class="space-y-4 lg:col-span-2">
            <article class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div class="flex items-center justify-between gap-2">
                <p class="text-xs font-semibold uppercase tracking-wide text-brand-gray">Assinatura atual</p>
                <span class="rounded-full bg-brand-mist px-2 py-0.5 text-xs font-medium text-brand-indigo">Período de teste</span>
              </div>
              <h2 class="mt-2 font-display text-xl font-semibold text-brand-ink">Avaliação gratuita</h2>
              <p class="mt-2 text-sm text-brand-gray">
                Você está usando o Rappeli em período de testes. Planos pagos serão anunciados quando estiverem disponíveis.
              </p>
              <button type="button" class="mt-6 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-brand-gray" disabled>
                Ver planos
              </button>
            </article>

            <article class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 class="font-display text-lg font-semibold text-brand-ink">Histórico de faturas</h2>
              <p class="mt-8 text-center text-sm text-brand-gray">Nenhuma fatura disponível.</p>
            </article>
          </section>

          <aside class="space-y-4">
            <article class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <div class="flex items-center justify-between">
                <h2 class="font-display text-sm font-semibold text-brand-ink">Equipe</h2>
                <Users class="h-4 w-4 text-brand-gray" aria-hidden="true" />
              </div>
              <p class="mt-4 text-sm text-brand-gray">Convites e permissões de equipe em breve.</p>
              <div class="mt-4 rounded-xl bg-brand-mist/50 p-3">
                <p class="text-sm font-medium text-brand-ink">{{ auth.user?.name ?? 'Você' }}</p>
                <p class="text-xs text-brand-gray">{{ auth.user?.email }}</p>
              </div>
            </article>

            <article class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <h2 class="font-display text-sm font-semibold text-brand-ink">Dados da empresa</h2>
              <dl class="mt-4 space-y-2 text-sm">
                <div class="flex justify-between gap-2">
                  <dt class="text-brand-gray">Responsável</dt>
                  <dd class="text-right text-brand-ink">{{ auth.user?.name ?? '—' }}</dd>
                </div>
                <div class="flex justify-between gap-2">
                  <dt class="text-brand-gray">E-mail</dt>
                  <dd class="text-right text-brand-ink">{{ auth.user?.email ?? '—' }}</dd>
                </div>
                <div class="flex justify-between gap-2">
                  <dt class="text-brand-gray">CNPJ</dt>
                  <dd class="text-right text-brand-gray">Não informado</dd>
                </div>
              </dl>
            </article>
          </aside>
        </div>
      </template>

      <template v-else-if="activeTab === 'WhatsApp'">
        <WhatsAppSettingsPanel />
      </template>

      <template v-else-if="activeTab === 'Empresa'">
        <section class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 class="font-display text-lg font-semibold text-brand-ink">Dados da conta</h2>
          <dl class="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-brand-gray">Nome</dt>
              <dd class="mt-1 text-sm text-brand-ink">{{ auth.user?.name ?? '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-brand-gray">E-mail</dt>
              <dd class="mt-1 text-sm text-brand-ink">{{ auth.user?.email ?? '—' }}</dd>
            </div>
          </dl>
          <p class="mt-6 text-sm text-brand-gray">
            Dados fiscais e informações adicionais da empresa poderão ser editados aqui futuramente.
          </p>
        </section>
      </template>

      <template v-else>
        <section class="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
          <p class="font-display text-lg font-semibold text-brand-ink">{{ activeTab }}</p>
          <p class="mt-2 text-sm text-brand-gray">Em breve você poderá gerenciar convites e permissões da equipe.</p>
        </section>
      </template>

      <AppPageFooter />
    </div>
  </div>
</template>
