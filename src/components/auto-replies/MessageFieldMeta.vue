<script setup lang="ts">
import { computed, ref } from 'vue'

import {
  AUTO_REPLY_MESSAGE_MAX_LENGTH,
  AUTO_REPLY_MESSAGE_TEMPLATE_TAGS,
} from '@/constants/messaging'
import { pluralWordPt } from '@/utils/pluralize'

const model = defineModel<string>({ required: true })

withDefaults(
  defineProps<{
    id: string
    label: string
    rows?: number
    placeholder?: string
    error?: string | null
    /** Estilo do painel v5 (contador à direita, barra de tags). */
    layout?: 'default' | 'panel'
    insertTags?: readonly string[]
    showFormattingHint?: boolean
  }>(),
  {
    rows: 4,
    layout: 'default',
    insertTags: () => AUTO_REPLY_MESSAGE_TEMPLATE_TAGS,
    showFormattingHint: true,
  },
)

const textareaRef = ref<HTMLTextAreaElement | null>(null)

const length = computed(() => model.value.length)
const nearLimit = computed(() => length.value > AUTO_REPLY_MESSAGE_MAX_LENGTH * 0.9)

const characterCountLabel = computed(
  () => `${length.value} ${pluralWordPt(length.value, 'caractere')}`,
)

function insertTag(tag: string): void {
  const el = textareaRef.value
  if (!el) {
    model.value = `${model.value}${tag}`
    return
  }
  const start = el.selectionStart ?? model.value.length
  const end = el.selectionEnd ?? start
  model.value = model.value.slice(0, start) + tag + model.value.slice(end)
  requestAnimationFrame(() => {
    el.focus()
    const next = start + tag.length
    el.setSelectionRange(next, next)
  })
}
</script>

<template>
  <div>
    <div
      class="flex flex-wrap items-baseline justify-between gap-2"
      :class="layout === 'panel' ? 'mb-2' : ''"
    >
      <label class="text-sm font-medium text-brand-ink" :for="id">{{ label }}</label>
      <p
        v-if="layout === 'panel'"
        class="text-xs tabular-nums text-brand-gray"
        :class="nearLimit ? 'font-medium text-amber-700' : ''"
      >
        {{ characterCountLabel }}
      </p>
    </div>

    <div
      class="overflow-hidden rounded-lg border border-slate-200 focus-within:border-brand-indigo focus-within:ring-2 focus-within:ring-brand-indigo/20"
      :class="layout === 'default' ? 'mt-1.5 border-0 focus-within:ring-0' : ''"
    >
      <textarea
        :id="id"
        ref="textareaRef"
        v-model="model"
        :rows="rows"
        :maxlength="AUTO_REPLY_MESSAGE_MAX_LENGTH"
        class="w-full resize-y border-0 px-3 py-2.5 text-sm text-brand-ink focus:outline-none"
        :class="layout === 'default' ? 'rounded-xl border border-slate-200 focus:border-brand-indigo focus:ring-2 focus:ring-brand-indigo/20' : ''"
        :placeholder="placeholder"
      />

      <div
        v-if="layout === 'panel' && insertTags.length"
        class="flex flex-wrap items-center gap-2 border-t border-slate-100 bg-slate-50/80 px-3 py-2"
      >
        <span class="text-xs font-medium text-brand-gray">Inserir tags:</span>
        <button
          v-for="tag in insertTags"
          :key="tag"
          type="button"
          class="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-medium text-brand-indigo hover:border-brand-indigo/30 hover:bg-brand-mist"
          @click="insertTag(tag)"
        >
          {{ tag }}
        </button>
      </div>
    </div>

    <div
      v-if="layout === 'default'"
      class="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-xs text-brand-gray"
    >
      <p v-if="showFormattingHint">Use *negrito* e _itálico_ conforme a formatação do WhatsApp.</p>
      <p :class="nearLimit ? 'font-medium text-amber-700' : ''">
        {{ length }} /
        {{ AUTO_REPLY_MESSAGE_MAX_LENGTH }}
        {{ pluralWordPt(AUTO_REPLY_MESSAGE_MAX_LENGTH, 'caractere') }}
      </p>
    </div>
    <p v-else-if="showFormattingHint" class="mt-2 text-xs text-brand-gray">
      Use *negrito* e _itálico_ conforme a formatação do WhatsApp. Tags como
      <span v-for="(tag, index) in insertTags" :key="tag">
        <code>{{ tag }}</code><span v-if="index < insertTags.length - 1">, </span>
      </span>
      são substituídas no envio quando disponíveis.
    </p>

    <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
  </div>
</template>
