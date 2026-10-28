<script setup lang="ts">
const supportEmail = 'mailto:contato@rappeli.com.br'
const privacyUrl = 'https://rappeli.com.br/privacidade'

withDefaults(
  defineProps<{
    showPrivacy?: boolean
    showSupport?: boolean
  }>(),
  { showPrivacy: true, showSupport: true },
)
</script>

<template>
  <footer class="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/80 pt-4 text-xs text-brand-gray">
    <span>© {{ new Date().getFullYear() }} Rappeli</span>
    <div class="flex flex-wrap items-center gap-4">
      <a v-if="showSupport" :href="supportEmail" class="hover:text-brand-indigo">Ajuda e suporte</a>
      <a
        v-if="showPrivacy"
        :href="privacyUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="hover:text-brand-indigo"
      >
        Políticas de privacidade
      </a>
    </div>
  </footer>
</template>
