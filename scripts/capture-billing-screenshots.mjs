import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { chromium } from '@playwright/test'

const baseUrl = process.env.PREVIEW_URL ?? 'http://127.0.0.1:4173'
const outDir =
  process.env.SCREENSHOT_DIR ??
  '/home/adao/.local/state/cursor/agent-stores/cursor_agent_stores/bc-b2538690-f4db-53e9-81dc-795ac3011957/files/billing-screenshots'

const mockUser = {
  id: 1,
  name: 'Maria Silva',
  email: 'maria@exemplo.invalid',
  company_id: 1,
}

const mockPlans = {
  modes: {
    meta_direct: {
      label: 'Pague a Meta direto',
      plans: [
        { id: 'essential_meta_monthly', tier: 'essencial', name: 'Essencial', cycle: 'MONTHLY', amount: 197 },
        { id: 'professional_meta_monthly', tier: 'profissional', name: 'Profissional', cycle: 'MONTHLY', amount: 397 },
        { id: 'escala_meta_monthly', tier: 'escala', name: 'Escala', cycle: 'MONTHLY', amount: 797 },
        { id: 'essential_meta_yearly', tier: 'essencial', name: 'Essencial', cycle: 'YEARLY', amount: 1970 },
        { id: 'professional_meta_yearly', tier: 'profissional', name: 'Profissional', cycle: 'YEARLY', amount: 3970 },
        { id: 'escala_meta_yearly', tier: 'escala', name: 'Escala', cycle: 'YEARLY', amount: 7970 },
      ],
    },
    included: {
      label: 'Mensagens incluídas',
      plans: [
        { id: 'essential_plus_monthly', tier: 'essencial', name: 'Essencial+', cycle: 'MONTHLY', amount: 297 },
        { id: 'professional_plus_monthly', tier: 'profissional', name: 'Profissional+', cycle: 'MONTHLY', amount: 547 },
        { id: 'escala_plus_monthly', tier: 'escala', name: 'Escala+', cycle: 'MONTHLY', amount: 1097 },
        { id: 'essential_plus_yearly', tier: 'essencial', name: 'Essencial+', cycle: 'YEARLY', amount: 2970 },
        { id: 'professional_plus_yearly', tier: 'profissional', name: 'Profissional+', cycle: 'YEARLY', amount: 5470 },
        { id: 'escala_plus_yearly', tier: 'escala', name: 'Escala+', cycle: 'YEARLY', amount: 10970 },
      ],
    },
  },
  shared_benefits: [
    'Disparos e automações inclusos',
    'Sem taxa de implantação',
    'Cancelamento em 1 clique',
    'Suporte humano em português',
  ],
  free_trial: false,
  setup_fee: false,
}

const pages = [
  { path: '/assinatura/planos', name: 'planos' },
  {
    path: '/assinatura/checkout?modality=meta_direct&tier=essencial&cycle=MONTHLY',
    name: 'checkout',
  },
  { path: '/assinatura', name: 'minha-assinatura' },
]

await mkdir(outDir, { recursive: true })

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })

await context.route('**/api/me', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ user: mockUser }),
  })
})

await context.route('**/api/billing/plans', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(mockPlans),
  })
})

await context.route('**/api/billing/subscription', async (route) => {
  if (route.request().method() === 'GET') {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 1,
        plan: 'essential_meta_monthly',
        plan_name: 'Essencial',
        modality: 'meta_direct',
        modality_label: 'Pague a Meta direto',
        tier: 'essencial',
        cycle: 'MONTHLY',
        status: 'ACTIVE',
        value: 197,
        next_due_date: '2026-11-26',
        payment_method: { brand: 'VISA', last_digits: '1111' },
        cancelled_at: null,
      }),
    })
    return
  }
  await route.continue()
})

await context.route('**/api/billing/payments', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      data: [
        {
          id: 1,
          asaas_payment_id: 'pay_1',
          status: 'RECEIVED',
          value: 197,
          due_date: '2026-10-26',
          paid_at: '2026-10-26T12:00:00Z',
          billing_type: 'CREDIT_CARD',
        },
      ],
    }),
  })
})

const page = await context.newPage()

for (const { path, name } of pages) {
  await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  const file = join(outDir, `billing-${name}-1280.png`)
  await page.screenshot({ path: file, fullPage: true })
  console.log('saved', file)
}

await browser.close()
