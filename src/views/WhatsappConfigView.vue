<script setup lang="ts">
import { Building2, CircleHelp, CreditCard, MessageCircle, Users } from '@lucide/vue'
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import WhatsAppBusinessSettings from '@/components/settings/WhatsAppBusinessSettings.vue'
import AppPageFooter from '@/components/layout/AppPageFooter.vue'
import AppPageShell from '@/components/layout/AppPageShell.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiSubNav from '@/components/ui/UiSubNav.vue'
import { useWhatsAppStore } from '@/stores/whatsapp'
import { formatBrazilPhone } from '@/utils/phone'
import {
  SETTINGS_TAB_KEYS,
  settingsSectionBreadcrumbs,
  settingsTabLabel,
  settingsTabQueryValue,
  type SettingsTabKey,
} from '@/utils/settingsTab'

const docsUrl = 'https://rappeli.com.br'

const router = useRouter()
const whatsappStore = useWhatsAppStore()

const activeTab = 'whatsapp' satisfies SettingsTabKey

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
  })),
)

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
  if (tab === 'whatsapp') {
    return
  }
  void router.push({ name: 'configuracoes', query: { tab: settingsTabQueryValue(tab) } })
}

onMounted(() => {
  if (!whatsappStore.hydrated) {
    void whatsappStore.refresh()
  }
})
</script>

<template>
  <AppPageShell
    title="WhatsApp Business"
    :breadcrumbs="settingsSectionBreadcrumbs('WhatsApp Business')"
  >
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
      <UiSubNav :items="settingsNavItems" :active="activeTab" @select="selectTab" />

      <div class="flex min-w-0 flex-1 flex-col">
        <div class="flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          <WhatsAppBusinessSettings />
          <AppPageFooter />
        </div>
      </div>
    </div>
  </AppPageShell>
</template>
