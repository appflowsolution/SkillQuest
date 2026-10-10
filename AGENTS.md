# SkillQuest (rbt-games) - Agent Instructions

## Project Identity & Engram Configuration (CRITICAL)
- **Engram Canonical Project:** `rbt-games`
- **Engram Rule:** Whenever interacting with Engram (`mem_save`, `mem_search`, `mem_context`, `mem_session_summary`, etc.), ALWAYS explicitly specify `project: "rbt-games"`.
- **No Overrides:** Never inherit, assume, or fallback to project `norberto` or any home-directory autodetection.
- Project local config is pinned in `.engram/config.json`.

## Commands
- **Dev Server:** `pnpm run dev` (runs Vite on host, dedicated port `5180` to prevent collisions with other local apps like TimeDesk on 5173).
- **Build:** `pnpm run build` (runs `vue-tsc` / TypeScript check + Vite production bundle).
- **E2E Testing:** `pnpm test` (executes Playwright E2E suite under `e2e/`, produces HTML report in `playwright-report/`).
- **Deploy:** Use `./deploy.sh` (or `./deploy.sh --with-tests` to run E2E suites before deploying). Deploys to Firebase Hosting target `skill-quest` (`https://skill-quest.web.app`).

## Architecture & Boundaries
- **Stack:** React 19 + TypeScript + Vite + Tailwind CSS v4 + Lucide Icons + Canvas Confetti.
- **Hosting:** Firebase Hosting (site target `skill-quest` in `firebase.json`).
- **Asset Optimization:** All game covers and AAC cards are optimized WebP images (`public/covers/*.webp`, `public/cards/aac/*.webp`).
- **PWA:** PWA manifests and icons configured in `public/manifest.json` and `index.html`.

## Testing Conventions
- Playwright E2E tests are located in `e2e/`:
  - `e2e/dashboard.spec.ts`: Game navigation, category tabs, and header.
  - `e2e/games.spec.ts`: Game launcher, fullscreen, score increment.
  - `e2e/layout.spec.ts`: Tablet viewport overflow guards (iPad 1180x820, 1080x810, 1024x768).
  - `e2e/performance.spec.ts`: Load time budgets and asset optimization limits.
