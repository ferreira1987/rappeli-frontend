<script setup lang="ts">
import { computed } from 'vue'

import { CAMPAIGN_SEND_RATE_HELP } from '@/constants/campaignSendRates'
import { campaignSendRateOptionsForForm } from '@/utils/campaignSendRate'

const model = defineModel<string>({ required: true })

const props = withDefaults(
  defineProps<{
    error?: string | null
    inputId?: string
    label?: string
    helpText?: string
    hideLabel?: boolean
  }>(),
  {
    label: 'Velocidade de envio',
    helpText: CAMPAIGN_SEND_RATE_HELP,
    hideLabel: false,
  },
)

const options = computed(() => campaignSendRateOptionsForForm(model.value))
</script>

<template>
  <div>
    <label
      v-if="!hideLabel"
      :for="inputId ?? 'campaign-send-rate'"
      class="block text-xs font-medium text-brand-ink"
    >
      {{ label }}
    </label>
    <select
      :id="inputId ?? 'campaign-send-rate'"
      v-model="model"
      class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-brand-ink"
      :class="[hideLabel ? '' : 'mt-1', props.error ? 'border-red-500' : '']"
      :aria-invalid="props.error ? 'true' : undefined"
      :aria-describedby="props.error ? 'campaign-send-rate-error' : 'campaign-send-rate-help'"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <p id="campaign-send-rate-help" class="mt-1 block text-[11px] text-brand-gray">
      {{ helpText }}
    </p>
    <p v-if="props.error" id="campaign-send-rate-error" class="mt-1 text-xs text-red-600" role="alert">
      {{ props.error }}
    </p>
  </div>
</template>
