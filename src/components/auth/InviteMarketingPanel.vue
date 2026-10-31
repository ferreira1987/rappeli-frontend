<script setup lang="ts">
import { GitBranch, History, Mail, MessageSquare } from '@lucide/vue'
import { computed } from 'vue'

import RappeliLogo from '@/components/brand/RappeliLogo.vue'

const props = withDefaults(
  defineProps<{
    /** `sidebar`: coluna esquerda no desktop; `below`: bloco abaixo do formulário no mobile */
    placement?: 'sidebar' | 'below'
  }>(),
  { placement: 'sidebar' },
)

const wrapperClass = computed(() => {
  if (props.placement === 'below') {
    return [
      'w-full max-w-[460px] rounded-2xl border border-[#4338CA]/20 bg-[#4338CA] p-6 text-white shadow-sm sm:p-8',
      'lg:hidden',
    ]
  }
  return [
    'relative hidden min-h-screen w-full shrink-0 flex-col justify-between overflow-y-auto bg-[#4338CA] p-8 text-white sm:p-12 lg:flex',
    'lg:w-[min(42%,520px)] lg:max-w-[520px] lg:p-14 xl:p-16',
  ]
})
</script>

<template>
  <component :is="placement === 'sidebar' ? 'aside' : 'section'" :class="wrapperClass">
    <div :class="placement === 'sidebar' ? 'flex flex-col space-y-8' : 'flex flex-col space-y-6'">
      <div class="flex items-center gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10"
        >
          <RappeliLogo mode="symbol" class="h-5 w-5" />
        </div>
        <div>
          <span class="block font-display text-2xl font-bold leading-none tracking-tight text-white">
            Rappeli
          </span>
          <p class="mt-0.5 text-xs text-white/80 sm:text-sm">Mensagens &amp; automações</p>
        </div>
      </div>

      <div :class="placement === 'sidebar' ? 'space-y-6 pt-4' : 'space-y-5'">
        <div
          class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white"
        >
          <Mail class="h-3.5 w-3.5" aria-hidden="true" />
          Convite de equipe
        </div>

        <h2
          class="max-w-md font-display text-xl font-bold leading-tight text-white sm:text-2xl lg:text-3xl"
        >
          Você foi convidado para colaborar no WhatsApp da sua empresa.
        </h2>
        <p class="max-w-md text-sm leading-relaxed text-white/85">
          Acesse conversas centralizadas, gerencie atendimentos em múltiplos atendentes e agilize
          respostas com estabilidade oficial.
        </p>

        <div class="space-y-4 pt-2">
          <div class="flex items-start gap-3">
            <div
              class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/15"
            >
              <MessageSquare class="h-4 w-4" aria-hidden="true" />
            </div>
            <p class="text-sm text-white">
              Atendimento simultâneo no mesmo número oficial do WhatsApp
            </p>
          </div>
          <div class="flex items-start gap-3">
            <div
              class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/15"
            >
              <History class="h-4 w-4" aria-hidden="true" />
            </div>
            <p class="text-sm text-white">Histórico compartilhado de conversas e notas internas</p>
          </div>
          <div class="flex items-start gap-3">
            <div
              class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/15"
            >
              <GitBranch class="h-4 w-4" aria-hidden="true" />
            </div>
            <p class="text-sm text-white">Distribuição inteligente e organização por setores</p>
          </div>
        </div>
      </div>
    </div>

    <div
      :class="
        placement === 'sidebar'
          ? 'mt-8 flex items-center gap-2 border-t border-white/15 pt-8 text-white/80'
          : 'mt-6 border-t border-white/15 pt-6 text-white/80'
      "
    >
      <span class="text-xs">Ambiente seguro com criptografia de ponta a ponta</span>
    </div>
  </component>
</template>
