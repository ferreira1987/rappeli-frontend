import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'

const reverbTarget = (env: Record<string, string>) =>
  env.VITE_REVERB_PROXY_TARGET || 'http://127.0.0.1:8080'

const apiProxy = (target: string, env: Record<string, string>) => ({
  '/api': {
    target,
    changeOrigin: true,
  },
  '/sanctum': {
    target,
    changeOrigin: true,
  },
  '/broadcasting': {
    target,
    changeOrigin: true,
  },
  '/app': {
    target: reverbTarget(env),
    changeOrigin: true,
    ws: true,
  },
})

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8000'

  return {
    plugins: [vue(), vueDevTools(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      proxy: apiProxy(proxyTarget, env),
    },
    preview: {
      port: 4173,
      proxy: apiProxy(proxyTarget, env),
    },
  }
})
