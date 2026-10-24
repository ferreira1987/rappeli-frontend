<script setup lang="ts">
defineProps<{
  open: boolean
  keyword?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-brand-ink/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="keyword-rule-delete-title"
      @click.self="emit('close')"
    >
      <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6">
        <h2 id="keyword-rule-delete-title" class="font-display text-lg font-semibold text-brand-ink">
          Excluir regra?
        </h2>
        <p class="mt-2 text-sm text-brand-gray">
          A regra
          <span v-if="keyword" class="font-medium text-brand-ink">“{{ keyword }}”</span>
          será removida permanentemente. Esta ação não pode ser desfeita.
        </p>
        <div class="mt-6 flex justify-end gap-2">
          <button
            type="button"
            class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-brand-gray hover:bg-slate-50"
            :disabled="loading"
            @click="emit('close')"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            :disabled="loading"
            @click="emit('confirm')"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
