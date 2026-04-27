---
applyTo: "AdminPanel/src/**"
---

# AdminPanel — Coding Instructions

## State Management Layers

| What                               | Tool                                                                              |
| ---------------------------------- | --------------------------------------------------------------------------------- |
| Server data (API responses)        | React Query (`@tanstack/react-query`) — see `src/app/providers/QueryProvider.jsx` |
| Global local state (UI, cart, POS) | Zustand — create stores under `src/features/<feature>/store/`                     |
| Auth state                         | React Context — do not move to Zustand                                            |

## TypeScript

- API types and service functions live in `src/services/api.ts` — define all response types there
- The rest of the app is `.jsx`; do **not** convert existing files to `.tsx` unless asked
- New service functions must use the typed interfaces already in `api.ts`

## Role-Gated Routes

Wrap any new protected page in `<ProtectedRoute minimumRole="..." />`. Role strings: `cashier`, `manager`, `admin`.

## POS Feature

- Keyboard shortcuts managed by `src/hooks/usePOSHotkeys.js` — register new shortcuts there
- POS state (cart, active table) should use the Zustand store in `src/features/pos/store/`

## Charts

Use **Recharts** for dashboard/report charts. Chart.js is available but Recharts is preferred for new work.
