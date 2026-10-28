import { mount, flushPromises } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { reactive } from 'vue'

import BillingCheckoutForms from '@/components/billing/BillingCheckoutForms.vue'
import { emptyCheckoutForms } from '@/utils/billingCheckoutValidation'

function mountCheckoutForms() {
  const forms = reactive(emptyCheckoutForms())

  const wrapper = mount(BillingCheckoutForms, {
    props: {
      holder: forms.holder,
      creditCard: forms.creditCard,
      fieldErrors: {},
      billingOnly: true,
      'onUpdate:creditCard': (card: typeof forms.creditCard) => {
        Object.assign(forms.creditCard, card)
      },
    },
  })

  return { wrapper, forms }
}

async function typeExpiryChars(wrapper: ReturnType<typeof mount>, chars: string[]): Promise<void> {
  const input = wrapper.find('#card-expiry')
  let typed = ''
  for (const char of chars) {
    typed += char
    await input.setValue(typed)
    await flushPromises()
  }
}

describe('BillingCheckoutForms expiry input', () => {
  it('keeps local MM/AA display while typing and emits full year in payload', async () => {
    const { wrapper, forms } = mountCheckoutForms()

    await typeExpiryChars(wrapper, ['0', '5', '3', '0'])

    const input = wrapper.find('#card-expiry').element as HTMLInputElement
    expect(input.value).toBe('05/30')
    expect(forms.creditCard.expiry_month).toBe('05')
    expect(forms.creditCard.expiry_year).toBe('2030')
  })

  it('accepts pasted MM/AA', async () => {
    const { wrapper, forms } = mountCheckoutForms()

    await wrapper.find('#card-expiry').setValue('05/30')
    await flushPromises()

    const input = wrapper.find('#card-expiry').element as HTMLInputElement
    expect(input.value).toBe('05/30')
    expect(forms.creditCard.expiry_month).toBe('05')
    expect(forms.creditCard.expiry_year).toBe('2030')
  })

  it('clears local display when parent clears expiry fields', async () => {
    const { wrapper, forms } = mountCheckoutForms()

    await typeExpiryChars(wrapper, ['0', '5', '3', '0'])
    forms.creditCard.expiry_month = ''
    forms.creditCard.expiry_year = ''
    await flushPromises()

    const input = wrapper.find('#card-expiry').element as HTMLInputElement
    expect(input.value).toBe('')
  })
})
