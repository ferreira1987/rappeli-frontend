<script setup lang="ts">
import { computed, useId } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    id?: string
    type?: 'text' | 'search' | 'email' | 'password' | 'tel' | 'number'
    placeholder?: string
    disabled?: boolean
    readonly?: boolean
    autocomplete?: string
    inputmode?: 'text' | 'numeric' | 'tel' | 'email' | 'decimal' | 'search'
    inputClass?: string
    invalid?: boolean
  }>(),
  {
    modelValue: '',
    type: 'text',
    disabled: false,
    readonly: false,
    invalid: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const fallbackId = useId()
const inputId = computed(() => props.id ?? fallbackId)

function onInput(event: Event): void {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="relative w-full">
    <span
      v-if="$slots.leading"
      class="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center text-brand-gray"
    >
      <slot name="leading" />
    </span>
    <input
      :id="inputId"
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :autocomplete="autocomplete"
      :inputmode="inputmode"
      :aria-invalid="invalid || undefined"
      class="w-full rounded-lg border bg-white py-2 text-sm text-brand-ink placeholder:text-brand-gray/80 focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20 disabled:cursor-not-allowed disabled:bg-slate-50 read-only:cursor-default read-only:bg-slate-50"
      :class="[
        $slots.leading ? 'pl-9 pr-3' : 'px-3',
        invalid ? 'border-red-300' : 'border-slate-200',
        inputClass,
      ]"
      @input="onInput"
    />
  </div>
</template>
