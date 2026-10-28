<script setup lang="ts">
import { Bell, CircleHelp } from '@lucide/vue'
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { fetchPendingTeamInvitations, fetchTeamAgents } from '@/api/team'
import AppPageHeader from '@/components/app/AppPageHeader.vue'
import AppPageTabs from '@/components/app/AppPageTabs.vue'
import CompanySettingsForm from '@/components/settings/CompanySettingsForm.vue'
import WhatsAppBusinessSettings from '@/components/settings/WhatsAppBusinessSettings.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import { panelBreadcrumbs } from '@/constants/panelBreadcrumbs'
import { pluralizePt } from '@/utils/pluralize'
import { getErrorMessage } from '@/utils/errors'

const route = useRoute()
const router = useRouter()

const tabs = ['Empresa', 'Equipe', 'Plano e cobrança', 'WhatsApp'] as const
const activeTab = ref<(typeof tabs)[number]>('Empresa')

const teamSummaryLoading = ref(false)
const teamSummaryError = ref<string | null>(null)
const teamAgentCount = ref<number | null>(null)
const teamPendingCount = ref<number | null>(null)

const teamSummaryLine = computed(() => {
  if (teamAgentCount.value == null) {
    return null
  }
  const agents = pluralizePt(teamAgentCount.value, 'atendente')
  const pending = teamPendingCount.value ?? 0
  if (pending <= 0) {
    return agents
  }
  return `${agents} · ${pluralizePt(pending, 'convite')}`
})

watch(
  () => route.query.tab,
  (tab) => {
    if (tab === 'whatsapp' || tab === 'WhatsApp') {
      activeTab.value = 'WhatsApp'
    } else if (tab === 'equipe' || tab === 'Equipe') {
      activeTab.value = 'Equipe'
    } else if (tab === 'plano' || tab === 'Plano') {
      activeTab.value = 'Plano e cobrança'
    } else if (tab === 'empresa' || tab === 'Empresa') {
      activeTab.value = 'Empresa'
    }
  },
  { immediate: true },
)

function tabQueryValue(tab: (typeof tabs)[number]): string | null {
  if (tab === 'WhatsApp') return 'whatsapp'
  if (tab === 'Equipe') return 'equipe'
  if (tab === 'Plano e cobrança') return 'plano'
  if (tab === 'Empresa') return 'empresa'
  return null
}

function selectTab(tab: (typeof tabs)[number]): void {
  activeTab.value = tab
  const queryValue = tabQueryValue(tab)
  if (queryValue) {
    void router.replace({ query: { ...route.query, tab: queryValue } })
  } else {
    const query = { ...route.query }
    delete query.tab
    void router.replace({ query })
  }
}

async function loadTeamSummary(): Promise<void> {
  teamSummaryLoading.value = true
  teamSummaryError.value = null
  try {
    const [agents, invitations] = await Promise.all([
      fetchTeamAgents(),
      fetchPendingTeamInvitations(),
    ])
    teamAgentCount.value = agents.length
    teamPendingCount.value = invitations.length
  } catch (error) {
    teamSummaryError.value = getErrorMessage(error)
    teamAgentCount.value = null
    teamPendingCount.value = null
  } finally {
    teamSummaryLoading.value = false
  }
}

onMounted(() => {
  void loadTeamSummary()
})
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
        <section class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-wide text-brand-gray">Assinatura</p>
          <h2 class="mt-2 font-display text-xl font-semibold text-brand-ink">Plano e pagamentos</h2>
          <p class="mt-2 text-sm text-brand-gray">
            Consulte seu plano, atualize o cartão, cancele ou veja o histórico de cobranças.
          </p>
          <div class="mt-6 flex flex-wrap gap-3">
            <RouterLink
              :to="{ name: 'minha-assinatura' }"
              class="rounded-xl bg-brand-indigo px-4 py-2 text-sm font-semibold text-white hover:bg-brand-indigo-hover"
            >
              Minha assinatura
            </RouterLink>
            <RouterLink
              :to="{ name: 'assinatura-planos' }"
              class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-brand-ink hover:bg-slate-50"
            >
              Ver planos
            </RouterLink>
          </div>
        </section>
      </template>

      <template v-else-if="activeTab === 'WhatsApp'">
        <WhatsAppBusinessSettings />
      </template>

      <template v-else-if="activeTab === 'Empresa'">
        <CompanySettingsForm />
      </template>

      <template v-else-if="activeTab === 'Equipe'">
        <section class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 class="font-display text-lg font-semibold text-brand-ink">Equipe</h2>
          <p class="mt-2 text-sm text-brand-gray">
            Atendentes, setores, papéis e regras de distribuição estão na área dedicada de equipe.
          </p>
          <p v-if="teamSummaryLoading" class="mt-4 text-sm text-brand-gray">Carregando resumo…</p>
          <p v-else-if="teamSummaryError" class="mt-4 text-sm text-red-600">{{ teamSummaryError }}</p>
          <p v-else-if="teamSummaryLine" class="mt-4 text-sm font-medium text-brand-ink">
            {{ teamSummaryLine }}
          </p>
          <RouterLink
            :to="{ name: 'equipe' }"
            class="mt-6 inline-flex rounded-xl bg-brand-indigo px-4 py-2 text-sm font-semibold text-white hover:bg-brand-indigo-hover"
          >
            Abrir equipe e distribuição
          </RouterLink>
        </section>
      </template>

      <AppPageFooter />
    </div>
  </div>
</template>
