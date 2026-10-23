# Rappeli Frontend

Vue 3 + Vite single-page application for [Rappeli](https://app.rappeli.com.br), a WhatsApp automation platform for customer service, reminders, confirmations and notifications for any business.

The Laravel API lives in [ferreira1987/rappeli-backend](https://github.com/ferreira1987/rappeli-backend). In production, Nginx serves this app's static build and proxies `/api` and `/sanctum` to the backend on the same origin.

## Stack

- Vue 3, TypeScript, Vue Router, Pinia
- Tailwind CSS v4
- Axios (Sanctum SPA cookie authentication, `withCredentials: true`)
- [@lucide/vue](https://lucide.dev) icons

## Local development

```bash
cp .env.example .env
npm install
npm run dev
```

By default, the dev server proxies `/api` and `/sanctum` to `VITE_API_PROXY_TARGET` (see `.env.example`). Run the backend locally on that URL so login and `/api/me` work.

### Authentication flow

1. `GET /sanctum/csrf-cookie`
2. `POST /api/login` with `email`, `password`, and optional `remember`
3. `GET /api/me` to load the authenticated user

Protected routes wait for the session bootstrap (`/api/me`) and redirect unauthenticated users to `/login`.

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Vite dev server          |
| `npm run build`| Production build to `dist/` |
| `npm run preview` | Preview production build |

## Deployment (self-hosted runner)

Workflow: [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)

1. Register a GitHub Actions self-hosted runner on the app server with labels `self-hosted`, `linux`, and a project-specific label (for example **`oracle-rappeli-frontend`**).
2. In the repository, open **Settings → Secrets and variables → Actions → Variables** and create:

   | Variable | Required | Description |
   | -------- | -------- | ----------- |
   | `VITE_REVERB_APP_KEY` | **Yes** | Public Reverb app key (same value as `REVERB_APP_KEY` on the API). Embedded in the JS bundle at build time. Deploy **fails** if empty. |
   | `VITE_REVERB_HOST` | No | WebSocket host (default in CI: `app.rappeli.com.br`). |
   | `VITE_REVERB_PORT` | No | WebSocket port (default in CI: `443`). |
   | `VITE_REVERB_SCHEME` | No | `http` or `https` (default in CI: `https`). |
   | `VITE_API_URL` | No | Optional API origin for `VITE_API_BASE_URL`. Leave unset when the SPA and API share `https://app.rappeli.com.br`. |
   | `DEPLOY_RUNNER_LABEL` | No | Third runner label if not using the workflow default `rappeli`. |

   Use **Variables** (not Secrets) for `VITE_*` values — they are not secret and must appear in the compiled frontend.

3. Ensure the runner user can write to `/var/www/rappeli-frontend` and that Nginx points `root` (or alias) at `/var/www/rappeli-frontend/current`, with `/app` proxied to Reverb and `/broadcasting` to Laravel.

The workflow runs `npm ci`, validates `VITE_REVERB_APP_KEY`, `npm run build` with the variables above, then [`scripts/deploy.sh`](scripts/deploy.sh), which copies `dist/` into a timestamped release under `releases/` and atomically updates the `current` symlink.

Trigger manually via **Actions → Deploy → Run workflow**, or push to `main`.

### Real-time (Reverb) in the browser

After login, `/api/me` must include `company_id` so the app can subscribe to the private channel `company.{companyId}.inbox`. Echo authenticates via `POST /broadcasting/auth` using the Sanctum session cookie and `X-XSRF-TOKEN` (`withCredentials` on the shared Axios client). If Reverb env vars were missing at build time, the console shows a explicit warning and inbox still works via REST polling (refresh).

## Project layout (Phase 0)

- `src/layouts/AppLayout.vue` — authenticated shell with sidebar
- `src/views/auth/LoginView.vue` — login UI (Rappeli Eco)
- `src/api/http.ts` — Axios client
- `src/stores/auth.ts` — session state and login

Placeholder pages: Painel, Conversas, Automações, Contatos, Configurações.
