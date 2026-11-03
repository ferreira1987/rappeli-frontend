<script setup lang="ts">
import { brandPrivacyUrl, brandSupportMailto, brandTermsUrl } from '@/constants/brandUrls'

withDefaults(
  defineProps<{
    showPrivacy?: boolean
    showTerms?: boolean
    showSupport?: boolean
  }>(),
  { showPrivacy: true, showTerms: true, showSupport: true },
)
</script>

<template>
  <footer
    class="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-4 text-xs text-brand-gray"
  >
    <span>© {{ new Date().getFullYear() }} Rappeli. Todos os direitos reservados.</span>
    <div class="flex flex-wrap items-center gap-4">
      <a
        v-if="showTerms"
        :href="brandTermsUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="hover:text-brand-indigo"
      >
        Termos de Uso
      </a>
      <a
        v-if="showPrivacy"
        :href="brandPrivacyUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="hover:text-brand-indigo"
      >
        Política de Privacidade
      </a>
      <a v-if="showSupport" :href="brandSupportMailto" class="hover:text-brand-indigo">Suporte</a>
    </div>
  </footer>
</template>
