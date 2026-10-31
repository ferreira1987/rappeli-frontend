<script setup lang="ts">
import {
  ArrowLeft,
  CheckCheck,
  Headphones,
  Megaphone,
  MoreVertical,
  Phone,
  Reply,
  Smartphone,
  Video,
} from '@lucide/vue'
import { computed } from 'vue'

import UiCard from '@/components/ui/UiCard.vue'
import type { MessageTemplate, MessageTemplateComponent } from '@/types/messageTemplates'
import { formatBrazilPhone } from '@/utils/phone'

const props = defineProps<{
  bodyText: string
  template: MessageTemplate | null | undefined
  verifiedName?: string | null
  displayPhone?: string | null
}>()

function findComponent(type: MessageTemplateComponent['type']): MessageTemplateComponent | undefined {
  return props.template?.components?.find((c) => c.type === type)
}

const headerComponent = computed(() => findComponent('HEADER'))
const footerText = computed(() => {
  const footer = findComponent('FOOTER')?.text?.trim()
  if (footer) return footer
  return props.template?.footer?.trim() || null
})

const headerText = computed(() => headerComponent.value?.text?.trim() || null)

type PreviewButton = { label: string }

const templateButtons = computed((): PreviewButton[] => {
  const raw = findComponent('BUTTONS')?.buttons
  if (!Array.isArray(raw)) return []
  const buttons: PreviewButton[] = []
  for (const item of raw) {
    if (item && typeof item === 'object' && 'text' in item) {
      const text = String((item as { text?: unknown }).text ?? '').trim()
      if (text) buttons.push({ label: text })
    }
  }
  return buttons
})

const previewTitle = computed(() => {
  const name = props.verifiedName?.trim()
  if (name) return name
  return 'WhatsApp Business'
})

const previewSubtitle = computed(() => {
  const formatted = formatBrazilPhone(props.displayPhone ?? null)
  if (formatted) return `${formatted} • Oficial`
  return 'Comercial • Oficial'
})

const hasBody = computed(() => Boolean(props.bodyText.trim()))
</script>

<template>
  <UiCard padding="lg" class="shadow-none">
    <div class="flex items-center justify-between border-b border-slate-200 pb-3">
      <div class="flex items-center gap-2">
        <Smartphone class="h-[18px] w-[18px] text-emerald-600" aria-hidden="true" />
        <h3 class="text-xs font-semibold text-brand-ink">Pré-visualização do WhatsApp</h3>
      </div>
      <span class="text-[11px] text-brand-gray">Exibição mobile real</span>
    </div>

    <div class="mt-4 overflow-hidden rounded-xl border border-slate-300 bg-[#ECE5DD] p-3">
      <div class="-mx-3 -mt-3 mb-3 flex items-center justify-between rounded-t-xl bg-[#075E54] px-3 py-2 text-white">
        <div class="flex min-w-0 items-center gap-2">
          <ArrowLeft class="h-4 w-4 shrink-0 opacity-90" aria-hidden="true" />
          <div
            class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#128C7E] text-[10px] font-bold"
          >
            R
          </div>
          <div class="min-w-0 leading-none">
            <p class="truncate text-[11px] font-semibold">{{ previewTitle }}</p>
            <p class="truncate text-[9px] text-[#E0F2F1]">{{ previewSubtitle }}</p>
          </div>
        </div>
        <div class="flex shrink-0 items-center gap-2 opacity-80">
          <Video class="h-3.5 w-3.5" aria-hidden="true" />
          <Phone class="h-3.5 w-3.5" aria-hidden="true" />
          <MoreVertical class="h-3.5 w-3.5" aria-hidden="true" />
        </div>
      </div>

      <div class="my-2 flex justify-center">
        <span class="rounded bg-white px-2 py-0.5 text-[10px] font-medium text-brand-gray shadow-sm">HOJE</span>
      </div>

      <div
        class="relative max-w-[90%] rounded-lg rounded-tl-none border border-slate-200 bg-white p-3 shadow-sm"
      >
        <div
          v-if="headerText"
          class="mb-2 flex items-center gap-2 rounded border border-slate-200 bg-slate-100 p-2"
        >
          <Megaphone class="h-4 w-4 shrink-0 text-brand-indigo" aria-hidden="true" />
          <span class="text-[10px] font-semibold uppercase tracking-wide text-brand-ink">{{ headerText }}</span>
        </div>

        <p v-if="hasBody" class="whitespace-pre-wrap text-xs leading-relaxed text-brand-ink">{{ bodyText }}</p>
        <p v-else class="text-xs text-brand-gray">Selecione um template aprovado.</p>

        <p v-if="footerText" class="mt-2 text-[11px] text-brand-gray">{{ footerText }}</p>

        <div class="mt-2 flex items-center justify-end gap-1 text-[9px] text-slate-400">
          <span>09:00</span>
          <CheckCheck class="h-3 w-3 text-sky-600" aria-hidden="true" />
        </div>

        <div v-if="templateButtons.length" class="mt-2.5 space-y-1.5 border-t border-slate-100 pt-2">
          <div
            v-for="(button, index) in templateButtons"
            :key="`${button.label}-${index}`"
            class="flex w-full items-center justify-center gap-1 rounded border border-slate-200 bg-brand-surface py-1 text-[11px] font-medium text-brand-indigo"
          >
            <Reply v-if="index === 0" class="h-3 w-3" aria-hidden="true" />
            <Headphones v-else class="h-3 w-3" aria-hidden="true" />
            {{ button.label }}
          </div>
        </div>
      </div>

      <p class="mt-3 text-center text-[9px] text-brand-gray">
        Responda PARAR para cancelar o recebimento destas mensagens.
      </p>
    </div>
  </UiCard>
</template>
