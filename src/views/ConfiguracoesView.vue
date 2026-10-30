<script setup lang="ts">
import { Building2, CircleHelp, CreditCard, MessageCircle, Users } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { fetchPendingTeamInvitations, fetchTeamAgents } from '@/api/team'
import CompanySettingsForm from '@/components/settings/CompanySettingsForm.vue'
import WhatsAppBusinessSettings from '@/components/settings/WhatsAppBusinessSettings.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import AppPageShell from '@/components/layout/AppPageShell.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiSubNav from '@/components/ui/UiSubNav.vue'
import { pluralizePt } from '@/utils/pluralize'
import { getErrorMessage } from '@/utils/errors'
import { useWhatsAppStore } from '@/stores/whatsapp'
import { formatBrazilPhone } from '@/utils/phone'
import {
  SETTINGS_TAB_KEYS,
  settingsSectionBreadcrumbs,
  settingsTabFromQuery,
  settingsTabLabel,
  settingsTabQueryValue,
  type SettingsTabKey,
} from '@/utils/settingsTab'

const docsUrl = 'https://rappeli.com.br'

const route = useRoute()
const router = useRouter()
const whatsappStore = useWhatsAppStore()

const activeTab = computed(() => settingsTabFromQuery(route.query.tab))

const pageTitle = computed(() => settingsTabLabel(activeTab.value))

const headerBreadcrumbs = computed(() => settingsSectionBreadcrumbs(pageTitle.value))

const teamSummaryLoading = ref(false)
const teamSummaryError = ref<string | null>(null)
const teamAgentCount = ref<number | null>(null)
const teamPendingCount = ref<number | null>(null)

const SETTINGS_NAV_ICONS = {
  empresa: Building2,
  equipe: Users,
  plano: CreditCard,
  whatsapp: MessageCircle,
} as const

const settingsNavItems = computed(() =>
  SETTINGS_TAB_KEYS.map((key) => ({
    key,
    label: settingsTabLabel(key),
    icon: SETTINGS_NAV_ICONS[key],
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

const showWhatsappDisconnectedBadge = computed(
  () => whatsappStore.hydrated && !whatsappStore.connected,
)

const whatsappHeaderLabel = computed(() => {
  if (!whatsappStore.hydrated || !whatsappStore.connected) {
    return null
  }
  const formatted = formatBrazilPhone(whatsappStore.displayPhoneNumber)
  return formatted || whatsappStore.displayPhoneNumber || 'WhatsApp conectado'
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
  if (!whatsappStore.hydrated) {
    void whatsappStore.refresh()
  }
})
</script>

<template>
  <AppPageShell :title="pageTitle" :breadcrumbs="headerBreadcrumbs">
    <template #actions>
      <span
        v-if="showWhatsappDisconnectedBadge"
        class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-brand-ink"
      >
        <span class="h-2 w-2 shrink-0 rounded-full bg-red-500" aria-hidden="true" />
        WhatsApp Desconectado
      </span>
      <span
        v-else-if="whatsappHeaderLabel"
        class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-brand-ink"
      >
        <span class="h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
        {{ whatsappHeaderLabel }}
      </span>
      <a :href="docsUrl" target="_blank" rel="noopener noreferrer" class="inline-flex">
        <UiButton variant="secondary" size="sm" class="gap-2 font-medium">
          <CircleHelp class="h-4 w-4 text-brand-gray" aria-hidden="true" />
          <span class="hidden sm:inline">Ver documentação</span>
          <span class="sm:hidden">Docs</span>
        </UiButton>
      </a>
    </template>

    <div class="flex min-h-0 flex-1 flex-col lg:flex-row">
      <UiSubNav
        :items="settingsNavItems"
        :active="activeTab"
        @select="selectTab"
      />

      <div class="flex min-w-0 flex-1 flex-col">
        <div class="flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          <template v-if="activeTab === 'plano'">
            <UiCard padding="lg">
              <p class="text-xs font-semibold uppercase tracking-wide text-brand-gray">Assinatura</p>
              <h2 class="mt-2 text-xl font-semibold text-brand-ink">Plano e pagamentos</h2>
              <p class="mt-2 text-sm text-brand-gray">
                Consulte seu plano, atualize o cartão, cancele ou veja o histórico de cobranças.
              </p>
              <div class="mt-6 flex flex-wrap gap-3">
                <RouterLink :to="{ name: 'minha-assinatura' }" class="inline-flex">
                  <UiButton>Minha assinatura</UiButton>
                </RouterLink>
                <RouterLink :to="{ name: 'assinatura-planos' }" class="inline-flex">
                  <UiButton variant="secondary">Ver planos</UiButton>
                </RouterLink>
              </div>
            </UiCard>
          </template>

          <WhatsAppBusinessSettings v-else-if="activeTab === 'whatsapp'" />

          <CompanySettingsForm v-else-if="activeTab === 'empresa'" :key="'empresa-settings'" />

          <template v-else-if="activeTab === 'equipe'">
            <UiCard padding="lg">
              <h2 class="text-lg font-semibold text-brand-ink">Equipe</h2>
              <p class="mt-2 text-sm text-brand-gray">
                Atendentes, setores, papéis e regras de distribuição estão na área dedicada de equipe.
              </p>
              <p v-if="teamSummaryLoading" class="mt-4 text-sm text-brand-gray">Carregando resumo…</p>
              <p v-else-if="teamSummaryError" class="mt-4 text-sm text-red-600">{{ teamSummaryError }}</p>
              <p v-else-if="teamSummaryLine" class="mt-4 text-sm font-medium text-brand-ink">
                {{ teamSummaryLine }}
              </p>
              <RouterLink :to="{ name: 'equipe' }" class="mt-6 inline-flex">
                <UiButton>Abrir equipe e distribuição</UiButton>
              </RouterLink>
            </UiCard>
          </template>

          <AppPageFooter />
        </div>
      </div>
    </div>
  </AppPageShell>
</template>
