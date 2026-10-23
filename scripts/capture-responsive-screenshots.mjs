import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { chromium } from '@playwright/test'

const baseUrl = process.env.PREVIEW_URL ?? 'http://127.0.0.1:4173'
const outDir =
  process.env.SCREENSHOT_DIR ??
  '/home/adao/.local/state/cursor/agent-stores/cursor_agent_stores/bc-de7f75b6-1a0a-5b2f-b32d-737ca33a02f2/files/mobile-screenshots'

const mockUser = {
  id: 1,
  name: 'Conta demonstração',
  email: 'demo@exemplo.invalid',
  company_id: 1,
}

const viewports = [
  { width: 360, height: 800, label: '360' },
  { width: 390, height: 844, label: '390' },
  { width: 768, height: 1024, label: '768' },
  { width: 1280, height: 800, label: '1280' },
]

const pages = [
  { path: '/painel', name: 'painel' },
  { path: '/conversas', name: 'conversas' },
  { path: '/configuracoes', name: 'configuracoes' },
  { path: '/login', name: 'login' },
]

const phase = process.env.SCREENSHOT_PHASE ?? 'after'

await mkdir(outDir, { recursive: true })

const browser = await chromium.launch()

for (const viewport of viewports) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
  })

  await context.route('**/api/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: mockUser }),
    })
  })

  await context.route('**/api/inbox/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
    })
  })

  await context.route('**/api/whatsapp/**', async (route) => {
    if (route.request().url().includes('/account')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ whatsapp_account: null }),
      })
      return
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ meta_app_id: 'x', embedded_signup_config_id: 'y' }),
    })
  })

  const page = await context.newPage()

  for (const { path, name } of pages) {
    await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)
    const file = join(outDir, `${phase}-${name}-${viewport.label}.png`)
    await page.screenshot({ path: file, fullPage: true })
    console.log('saved', file)
  }

  await context.close()
}

await browser.close()
