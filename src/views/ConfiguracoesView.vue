<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { fetchPendingTeamInvitations, fetchTeamAgents } from '@/api/team'
import AppPageHeader from '@/components/app/AppPageHeader.vue'
import UiSubNav from '@/components/ui/UiSubNav.vue'
import CompanySettingsForm from '@/components/settings/CompanySettingsForm.vue'
import WhatsAppBusinessSettings from '@/components/settings/WhatsAppBusinessSettings.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import { panelBreadcrumbs } from '@/constants/panelBreadcrumbs'
import { pluralizePt } from '@/utils/pluralize'
import { getErrorMessage } from '@/utils/errors'
import {
  SETTINGS_TAB_KEYS,
  settingsTabFromQuery,
  settingsTabLabel,
  settingsTabQueryValue,
  type SettingsTabKey,
} from '@/utils/settingsTab'

const route = useRoute()
const router = useRouter()

const activeTab = computed(() => settingsTabFromQuery(route.query.tab))

const teamSummaryLoading = ref(false)
const teamSummaryError = ref<string | null>(null)
const teamAgentCount = ref<number | null>(null)
const teamPendingCount = ref<number | null>(null)

const settingsNavItems = computed(() =>
  SETTINGS_TAB_KEYS.map((key) => ({
    key,
    label: settingsTabLabel(key),
    hint:
      key === 'equipe' && teamSummaryLine.value && !teamSummaryLoading.value && !teamSummaryError.value
        ? teamSummaryLine.value
        : undefined,
  })),
)

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

function selectTab(tab: SettingsTabKey): void {
  void router.replace({ query: { ...route.query, tab: settingsTabQueryValue(tab) } })
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
  <div class="flex min-h-full flex-col bg-brand-surface">
    <AppPageHeader
      title="Configurações"
      subtitle="Gerencie sua conta, equipe, dados fiscais e cobrança."
      :breadcrumbs="panelBreadcrumbs({ label: 'Configurações' })"
    >
    </AppPageHeader>

    <div class="flex min-h-0 flex-1 flex-col lg:flex-row">
      <UiSubNav
        :items="settingsNavItems"
        :active="activeTab"
        @select="selectTab"
      />

      <div class="flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <template v-if="activeTab === 'plano'">
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

      <WhatsAppBusinessSettings v-else-if="activeTab === 'whatsapp'" />

      <CompanySettingsForm v-else-if="activeTab === 'empresa'" :key="'empresa-settings'" />

      <template v-else-if="activeTab === 'equipe'">
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
  </div>
</template>
