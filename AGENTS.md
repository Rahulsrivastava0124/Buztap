# tableQR — Agent Instructions

## Project Overview

Monorepo with two React apps:

- **`AdminPanel/`** — Restaurant/Hotel management dashboard (POS, orders, tables, staff, reports, inventory)
- **`TableFrontend/`** — Guest-facing ordering platform (menu browsing, order history, restaurant search)

## Build & Dev Commands

Run from each app directory:

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run lint      # ESLint check
npm run preview   # Preview production build
```

## Tech Stack (Both Apps)

| Layer     | Library                                        |
| --------- | ---------------------------------------------- |
| UI        | React 19 + Vite 8 + Tailwind CSS 4 + DaisyUI 5 |
| Routing   | React Router 7                                 |
| Animation | Framer Motion 12                               |
| Icons     | Lucide React, React Icons                      |

**AdminPanel extras:** React Query (server state), Zustand (local state), Chart.js, Recharts, TypeScript API layer (`src/services/api.ts`)  
**TableFrontend:** Context API only — no external state management

## Architecture

### Authentication & RBAC

- Auth state lives in `src/context/AuthContext.jsx` (both apps)
- Roles: `cashier` (1) → `manager` (2) → `admin` (3); business types: `restro` | `hotel`
- Use `hasRoleAccess(role, minimumRole)` from `utils/access.js` for permission checks
- Credentials come from env vars: `VITE_APP_USERNAME`, `VITE_ADMIN_USERNAME`, etc.
- `ProtectedRoute` component (`AdminPanel/src/components/ProtectedRoute.jsx`) enforces auth + role

### Data

- Mock data in `src/data/database.js` — replace with real API calls via `src/services/api.ts` (AdminPanel)
- TableFrontend has no API service layer yet (`src/services/` is empty)

### Routing

- All routes defined directly in `src/App.jsx` — the `src/app/router/` directory is intentionally empty
- AdminPanel routes are role-gated (see `App.jsx` for mapping)

## Key Conventions

- **Components**: PascalCase files and folders (`AuthPage.jsx`, `ProtectedRoute.jsx`)
- **Hooks**: `use` prefix, camelCase (`usePOSHotkeys.js`, `useSEO.js`)
- **Utils**: camelCase module files (`access.js`, `seo.js`)
- **Feature slices**: `src/features/<feature>/store/` for Zustand stores (AdminPanel pattern)
- **No barrel index files** except `src/components/landing/index.js`

## Known Issues / Cleanup Needed

- **Shared landing components** duplicated across both apps (`src/components/landing/`) — candidate for extraction to a shared package

## What NOT to Do

- Don't add TypeScript to TableFrontend unless asked — it's intentionally lightweight
- Don't create separate router files; keep routing in `App.jsx`
- Don't move credentials into code — always use `VITE_` env vars
- Don't use the `" 2"` duplicates — they are stale backups
