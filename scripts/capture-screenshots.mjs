import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { chromium } from '@playwright/test'

const baseUrl = process.env.PREVIEW_URL ?? 'http://127.0.0.1:4173'
const outDir =
  process.env.SCREENSHOT_DIR ??
  '/home/adao/.local/state/cursor/agent-stores/cursor_agent_stores/bc-de52eb37-9dd4-5f24-8ea9-926f45beab26/files/ui-screenshots'

const mockUser = { id: 1, name: 'Conta demonstração', email: 'demo@exemplo.invalid' }

const pages = [
  { path: '/login', name: '01-login' },
  { path: '/onboarding/whatsapp', name: '02-onboarding-whatsapp' },
  { path: '/painel', name: '03-dashboard' },
  { path: '/conversas', name: '04-conversas' },
  { path: '/automacoes', name: '05-automacoes' },
  { path: '/automacoes/editor', name: '06-editor-automacao' },
  { path: '/contatos', name: '07-contatos' },
  { path: '/configuracoes', name: '08-configuracoes' },
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

const page = await context.newPage()

for (const { path, name } of pages) {
  await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  await page.screenshot({ path: join(outDir, `${name}.png`), fullPage: true })
  console.log('saved', name)
}

await browser.close()
console.log('Screenshots in', outDir)
