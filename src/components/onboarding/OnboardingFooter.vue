<script setup lang="ts">
import { brandPrivacyUrl, brandTermsUrl } from '@/constants/brandUrls'

withDefaults(
  defineProps<{
    muted?: boolean
  }>(),
  {
    muted: false,
  },
)
</script>

<template>
  <footer
    class="border-t border-slate-200 py-4"
    :class="muted ? 'bg-[#F8FAFC]' : 'bg-white'"
  >
    <div
      class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 text-sm text-slate-500 sm:flex-row md:px-8"
    >
      <p>© 2026 Rappeli — ADS System</p>
      <div class="flex items-center gap-6">
        <a :href="brandTermsUrl" target="_blank" rel="noopener noreferrer" class="hover:text-brand-indigo">
          Termos de Uso
        </a>
        <a :href="brandPrivacyUrl" target="_blank" rel="noopener noreferrer" class="hover:text-brand-indigo">
          Política de Privacidade
        </a>
      </div>
    </div>
  </footer>
</template>
