import { fileURLToPath } from 'node:url'
import type { ConfigEnv } from 'vite'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config.ts'

const testEnv: ConfigEnv = { mode: 'test', command: 'serve', isSsrBuild: false }

export default mergeConfig(
  viteConfig(testEnv),
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
    },
  }),
)
