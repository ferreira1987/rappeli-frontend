import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { chromium } from '@playwright/test'

const baseUrl = process.env.PREVIEW_URL ?? 'http://127.0.0.1:4173'
const prefix = process.env.SCREENSHOT_PREFIX ?? 'after'
const outDir =
  process.env.SCREENSHOT_DIR ??
  '/home/adao/.local/state/cursor/agent-stores/cursor_agent_stores/bc-ba959033-0f3e-571d-97d6-1950e599446c/files/header-screenshots'

const mockUser = {
  id: 1,
  name: 'Conta demonstração',
  email: 'demo@exemplo.invalid',
  company_id: 1,
}

const pages = [
  { path: '/campanhas', name: `${prefix}-campanhas` },
  { path: '/contatos', name: `${prefix}-contatos` },
  { path: '/conversas', name: `${prefix}-conversas` },
]

await mkdir(outDir, { recursive: true })

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })

await context.route('**/api/me', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(mockUser),
  })
})

await context.route('**/api/inbox/**', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ data: [], meta: { counts: {} } }),
  })
})

await context.route('**/api/dashboard/**', async (route) => {
  await route.fulfill({ status: 404, body: '{}' })
})

const page = await context.newPage()

for (const { path, name } of pages) {
  await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  await page.screenshot({ path: join(outDir, `${name}.png`) })
  console.log('saved', name)
}

await browser.close()
console.log('Screenshots in', outDir)
