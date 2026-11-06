<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

## StudioSpace — Studio Sharing Platform

Peer-to-peer marketplace for creative production spaces. This repo is the
**frontend only** (Next.js 16.4 App Router, React 19, TypeScript strict).
The backend API runs separately on `NEXT_PUBLIC_API_URL` (dev: `http://localhost:8000`).

## Commands

- `npm run dev` — dev server (Turbopack, port 3000)
- `npm run build` / `npm run start`
- `npm run lint` — bare `eslint` (flat config, eslint-config-next)
- **No test suite and no typecheck script.** For type checking run `npx tsc --noEmit`.
- Use `npm` (package-lock.json is committed).

## Toolchain Quirks

- **React Compiler is enabled** (`reactCompiler: true` in `next.config.ts`).
  Do not add manual `useMemo`/`useCallback`/`memo` for re-render optimization.
- **Tailwind v4 with CSS-only config** — there is no `tailwind.config`. All design
  tokens (colors, radii, shadows, spacing) live in `src/app/globals.css` under
  `:root` (light) and `.dark` (dark). Change themes there; never hardcode hex
  values in components.
- **Dark mode is class-based**: `.dark` on `<html>` via
  `@custom-variant dark (&:is(.dark *))`. Theme is persisted under
  `localStorage["studiospace_theme"]` (see `src/components/shared/ThemeToggle.tsx`).
  Every component must work in both modes — use semantic tokens (`bg-background`,
  `text-foreground`), never raw colors.
- **shadcn/ui, `base-nova` style** on `@base-ui/react` primitives (config in
  `components.json`). Path aliases: `@/*` → `src/*`; `@/components/ui`, `@/lib`, `@/hooks`.
- **Fonts** are set as CSS variables on `<html>` in `src/app/layout.tsx`:
  `font-heading` (DM Sans) for headings, `font-sans` (Public Sans) for body/UI.

## Routes & Auth Architecture

- Pages live in two route groups with different layouts:
  - `src/app/(root)/` — public pages, `<Navbar>` wrapper (+ `<Toaster>` from root layout)
  - `src/app/(dashboard)/dashboard/` — authenticated dashboard (add-studio,
    my-bookings, my-listings), `<DashboardSidebar>` wrapper, **no Navbar**
- **better-auth** stack:
  - Server: `src/lib/auth.ts` (MongoDB adapter, database `studiospace`; email/password + Google)
  - Handler: `src/app/api/auth/[...all]/route.ts` via `toNextJsHandler`
  - Client: `src/lib/auth-client.ts` (`baseURL = BETTER_AUTH_URL`)
  - In components use `src/hooks/useAuth.ts`, not raw `useSession`.

## Data Rules — No Mock Data (critical)

- **Never hardcode or mock API data** — no `src/data/`, no `mock-*.ts`, no arrays
  of fake studios/users/bookings/reviews/prices. This is a UI-first workspace;
  the backend supplies real data before pages are wired.
- Components display data via **props or hooks** and must render **loading,
  error, and empty states**; handle `null`/`undefined` shapes gracefully.
- **Do not invent API endpoint paths or contracts.** Wait for explicit endpoint
  info from the user. Until then, build static UI shells with clearly marked TODOs.
- API calls go through dedicated utilities in `src/lib/api/` (see
  `src/lib/api/studios.ts` for the pattern); types in `src/types/`. Base URL
  always from `process.env.NEXT_PUBLIC_API_URL`.

## Design Conventions (project-distinct only)

- **Two-tone headings**: regular words in `text-foreground`, key phrase in
  `text-accent italic` (e.g. "Premium *Creative Studios* Built for Creators…").
- **Section labels**: `• OUR SPACES` — `text-xs uppercase tracking-[0.2em] text-muted-foreground`.
- **Buttons**: primary CTA = pill (`rounded-full`) `bg-primary text-primary-foreground`
  with a trailing arrow icon; destructive = `bg-destructive/10 text-destructive`.
- **Cards**: equal height in grids (`grid` + `h-full`), `rounded-2xl`, `p-6`,
  `shadow-sm`; featured card uses `bg-card-highlight` with cream text.
- **Images**: `next/image` with `alt`, `aspect-video`/`aspect-[4/3]`, `object-cover`.
- **Social icons**: use the **X logo**, not the Twitter bird.

## Secrets & Env

- `.env` is gitignored but contains **real credentials** (MongoDB URI, Google
  OAuth secret, auth secret). Never print, commit, or transmit its contents.
- Only `NEXT_PUBLIC_*` vars are exposed to the browser; server-only vars
  (`MONGODB_URI`, `BETTER_AUTH_SECRET`, `GOOGLE_*`) must be referenced from
  server code only.
