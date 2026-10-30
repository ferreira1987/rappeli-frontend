<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'

import AppSidebar from '@/components/app/AppSidebar.vue'
import AppMobileTopbar from '@/components/layout/AppMobileTopbar.vue'
import { provideAppSidebar } from '@/composables/useAppSidebar'
import { useInboxRealtimeSession } from '@/composables/useInboxRealtimeSession'
import { useInboxNavStore } from '@/stores/inboxNav'
import { useWhatsAppStore } from '@/stores/whatsapp'

const route = useRoute()
const { isOpen, close } = provideAppSidebar()
const whatsappStore = useWhatsAppStore()
const inboxNav = useInboxNavStore()

useInboxRealtimeSession()

onMounted(() => {
  void whatsappStore.refresh()
  void inboxNav.refresh()
})

const isFullBleed = computed(() => route.meta.fullBleed === true)

watch(
  () => route.fullPath,
  () => {
    close()
  },
)
</script>

<template>
  <div class="flex h-screen min-h-screen overflow-hidden bg-brand-surface">
    <div
      v-show="isOpen"
      class="fixed inset-0 z-40 bg-brand-ink/40 backdrop-blur-[1px] lg:hidden"
      aria-hidden="true"
      @click="close()"
    />

    <AppSidebar />

    <div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <AppMobileTopbar />
      <div
        class="min-h-0 flex-1 overflow-x-hidden overflow-y-auto"
        :class="isFullBleed ? '' : 'bg-brand-surface'"
      >
        <RouterView />
      </div>
    </div>
  </div>
</template>
