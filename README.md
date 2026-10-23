<<<<<<< HEAD
# rappeli-frontend
=======
# Rappeli Frontend

Vue 3 + Vite single-page application for [Rappeli](https://app.rappeli.com.br), a WhatsApp automation platform for automotive workshops.

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

1. Register a GitHub Actions self-hosted runner on the app server with labels `self-hosted`, `linux`, and a project-specific label (default **`rappeli`**).
2. In the repository, set **Settings → Secrets and variables → Actions → Variables**:
   - `DEPLOY_RUNNER_LABEL` — optional; must match the third runner label if not using `rappeli`.
3. Ensure the runner user can write to `/var/www/rappeli-frontend` and that Nginx points `root` (or alias) at `/var/www/rappeli-frontend/current`.

The workflow runs `npm ci`, `npm run build`, then [`scripts/deploy.sh`](scripts/deploy.sh), which copies `dist/` into a timestamped release under `releases/` and atomically updates the `current` symlink.

Trigger manually via **Actions → Deploy → Run workflow**, or push to `main`.

## Project layout (Phase 0)

- `src/layouts/AppLayout.vue` — authenticated shell with sidebar
- `src/views/auth/LoginView.vue` — login UI (Rappeli Eco)
- `src/api/http.ts` — Axios client
- `src/stores/auth.ts` — session state and login

Placeholder pages: Painel, Conversas, Automações, Contatos, Configurações.
>>>>>>> 812a497 (feat: Phase 0 SPA skeleton with Sanctum login and deploy)
