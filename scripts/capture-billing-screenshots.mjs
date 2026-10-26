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
  { path: '/cadastro', name: '1-cadastro', auth: false },
  { path: '/contratacao/plano', name: '2-plano', auth: true },
  { path: '/contratacao/pagamento', name: '3-pagamento', auth: true, seedPlan: true },
  { path: '/contratacao/ativacao', name: '4-ativacao', auth: true },
]

await mkdir(outDir, { recursive: true })

const browser = await chromium.launch()

for (const pageDef of pages) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })

  if (pageDef.auth) {
    await context.route('**/api/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: mockUser }),
      })
    })
  } else {
    await context.route('**/api/me', async (route) => {
      await route.fulfill({ status: 401, contentType: 'application/json', body: '{}' })
    })
  }

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
        body: JSON.stringify({ subscription: null }),
      })
      return
    }
    await route.continue()
  })

  await context.route('**/api/whatsapp/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ meta_app_id: 'x', embedded_signup_config_id: 'y' }),
    })
  })

  const page = await context.newPage()

  if (pageDef.seedPlan) {
    await page.addInitScript(() => {
      sessionStorage.setItem(
        'rappeli.checkout-flow.v1',
        JSON.stringify({
          modality: 'included',
          tier: 'profissional',
          cycle: 'YEARLY',
          planId: 'professional_plus_yearly',
          planName: 'Profissional+',
          amount: 5470,
          modalityLabel: 'Mensagens incluídas',
          whatsapp: '',
          companyName: '',
        }),
      )
    })
  }

  await page.goto(`${baseUrl}${pageDef.path}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)
  const file = join(outDir, `onboarding-${pageDef.name}-1280.png`)
  await page.screenshot({ path: file, fullPage: true })
  console.log('saved', file)
  await context.close()
}

await browser.close()
