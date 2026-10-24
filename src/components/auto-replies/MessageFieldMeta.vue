<script setup lang="ts">
import { computed } from 'vue'

import { AUTO_REPLY_MESSAGE_MAX_LENGTH } from '@/constants/messaging'

const model = defineModel<string>({ required: true })

defineProps<{
  id: string
  label: string
  rows?: number
  placeholder?: string
  error?: string | null
}>()

const length = computed(() => model.value.length)
const nearLimit = computed(() => length.value > AUTO_REPLY_MESSAGE_MAX_LENGTH * 0.9)
</script>

<template>
  <div>
    <label class="text-sm font-medium text-brand-ink" :for="id">{{ label }}</label>
    <textarea
      :id="id"
      v-model="model"
      :rows="rows ?? 4"
      :maxlength="AUTO_REPLY_MESSAGE_MAX_LENGTH"
      class="mt-1.5 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-brand-ink focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
      :placeholder="placeholder"
    />
    <div class="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-xs text-brand-gray">
      <p>Use *negrito* e _itálico_ conforme a formatação do WhatsApp.</p>
      <p :class="nearLimit ? 'font-medium text-amber-700' : ''">
        {{ length }} / {{ AUTO_REPLY_MESSAGE_MAX_LENGTH }}
      </p>
    </div>
    <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
  </div>
</template>
