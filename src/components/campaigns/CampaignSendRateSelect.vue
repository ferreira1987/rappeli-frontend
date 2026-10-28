<script setup lang="ts">
import { computed } from 'vue'

import { CAMPAIGN_SEND_RATE_HELP } from '@/constants/campaignSendRates'
import { campaignSendRateOptionsForForm } from '@/utils/campaignSendRate'

const model = defineModel<string>({ required: true })

const props = defineProps<{
  error?: string | null
  inputId?: string
}>()

const options = computed(() => campaignSendRateOptionsForForm(model.value))
</script>

<template>
  <div>
    <label :for="inputId ?? 'campaign-send-rate'" class="block text-sm font-medium text-brand-ink">
      Velocidade de envio
    </label>
    <select
      :id="inputId ?? 'campaign-send-rate'"
      v-model="model"
      class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-brand-ink"
      :class="props.error ? 'border-red-500' : ''"
      :aria-invalid="props.error ? 'true' : undefined"
      :aria-describedby="props.error ? 'campaign-send-rate-error' : 'campaign-send-rate-help'"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <p id="campaign-send-rate-help" class="mt-2 text-xs text-brand-gray">
      {{ CAMPAIGN_SEND_RATE_HELP }}
    </p>
    <p v-if="props.error" id="campaign-send-rate-error" class="mt-1 text-xs text-red-600" role="alert">
      {{ props.error }}
    </p>
  </div>
</template>
