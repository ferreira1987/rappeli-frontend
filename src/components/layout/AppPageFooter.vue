<script setup lang="ts">
withDefaults(
  defineProps<{
    showPrivacy?: boolean
  }>(),
  { showPrivacy: true },
)
</script>

<template>
  <footer class="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/80 pt-4 text-xs text-brand-gray">
    <span>© {{ new Date().getFullYear() }} Rappeli</span>
    <a v-if="showPrivacy" href="#" class="hover:text-brand-indigo" @click.prevent>Políticas de privacidade</a>
  </footer>
</template>
