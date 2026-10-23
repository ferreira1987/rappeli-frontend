<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'

import AppSidebar from '@/components/app/AppSidebar.vue'

const route = useRoute()

const sidebarTheme = computed(() =>
  route.meta.sidebarTheme === 'ink' ? 'ink' : 'light',
)

const isFullBleed = computed(() => route.meta.fullBleed === true)
</script>

<template>
  <div class="flex h-screen min-h-screen overflow-hidden bg-brand-mist">
    <AppSidebar :theme="sidebarTheme" />
    <div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div class="min-h-0 flex-1 overflow-y-auto" :class="isFullBleed ? '' : 'bg-brand-mist'">
        <RouterView />
      </div>
    </div>
  </div>
</template>
