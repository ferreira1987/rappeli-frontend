<script setup lang="ts">
import { Bell, CircleHelp, Users } from '@lucide/vue'
import { ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import AppPageHeader from '@/components/app/AppPageHeader.vue'
import AppPageTabs from '@/components/app/AppPageTabs.vue'
import WhatsAppSettingsPanel from '@/components/whatsapp/WhatsAppSettingsPanel.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import { panelBreadcrumbs } from '@/constants/panelBreadcrumbs'
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
  <div class="flex min-h-full flex-col bg-brand-mist">
    <AppPageHeader
      title="Configurações"
      subtitle="Gerencie sua conta, equipe, dados fiscais e cobrança."
      :breadcrumbs="panelBreadcrumbs({ label: 'Configurações' })"
    >
      <template #actions>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-brand-ink hover:bg-slate-50"
          disabled
        >
          <CircleHelp class="h-4 w-4 text-brand-gray" />
          Suporte
        </button>
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-brand-gray hover:bg-slate-50"
          disabled
          aria-label="Notificações"
        >
          <Bell class="h-4 w-4" />
        </button>
      </template>
    </AppPageHeader>

    <AppPageTabs>
      <button
        v-for="tab in tabs"
        :key="tab"
        type="button"
        class="shrink-0 whitespace-nowrap border-b-2 py-3 text-sm font-semibold transition"
        :class="
          activeTab === tab
            ? 'border-brand-indigo text-brand-indigo'
            : 'border-transparent text-brand-gray hover:text-brand-ink'
        "
        @click="selectTab(tab)"
      >
        {{ tab }}
      </button>
    </AppPageTabs>

    <div class="flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <template v-if="activeTab === 'Plano e cobrança'">
        <div class="grid gap-6 lg:grid-cols-3">
          <section class="space-y-4 lg:col-span-2">
            <article class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-wide text-brand-gray">Assinatura</p>
              <h2 class="mt-2 font-display text-xl font-semibold text-brand-ink">Plano e pagamentos</h2>
              <p class="mt-2 text-sm text-brand-gray">
                Consulte seu plano, atualize o cartão, cancele ou veja o histórico de cobranças.
              </p>
              <div class="mt-6 flex flex-wrap gap-3">
                <RouterLink
                  :to="{ name: 'minha-assinatura' }"
                  class="rounded-xl bg-brand-indigo px-4 py-2 text-sm font-semibold text-white"
                >
                  Minha assinatura
                </RouterLink>
                <RouterLink
                  :to="{ name: 'assinatura-planos' }"
                  class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-brand-ink"
                >
                  Ver planos
                </RouterLink>
              </div>
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
