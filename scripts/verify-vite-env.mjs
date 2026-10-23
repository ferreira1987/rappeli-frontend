#!/usr/bin/env node

/**
 * Ensures production CI builds embed Reverb settings in the Vite bundle.
 * Run before `npm run build` on the deploy runner (do not print secret values).
 */

const key = process.env.VITE_REVERB_APP_KEY?.trim()

if (!key) {
  console.error(
    [
      '',
      'Build aborted: VITE_REVERB_APP_KEY is missing or empty.',
      '',
      'Production deploys must pass VITE_REVERB_* into `npm run build` so Laravel Echo',
      'can connect to Reverb (values are public in the client bundle).',
      '',
      'Create GitHub Actions variables under:',
      '  Settings → Secrets and variables → Actions → Variables',
      '',
      'Required:',
      '  - VITE_REVERB_APP_KEY (must match REVERB_APP_KEY on the API)',
      '',
      'Optional (defaults applied in deploy workflow if unset):',
      '  - VITE_REVERB_HOST (default app.rappeli.com.br)',
      '  - VITE_REVERB_PORT (default 443)',
      '  - VITE_REVERB_SCHEME (default https)',
      '  - VITE_API_URL (optional; maps to VITE_API_BASE_URL when not same-origin)',
      '',
    ].join('\n'),
  )
  process.exit(1)
}
