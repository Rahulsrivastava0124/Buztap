# tableQR Project Structure and Purpose

This project contains two main web apps inside one monorepo:

- `AdminPanel/`: Business operations dashboard for restaurant/hotel owners and staff
- `TableFrontend/`: Guest-facing ordering experience used by customers

## 1) AdminPanel Purpose

`AdminPanel` is the operational control center for a business.

Primary responsibilities:
- Authentication and role-based access (`cashier`, `manager`, `admin`)
- POS and checkout operations
- Table management and order lifecycle management
- Staff, inventory, reports, offers, and settings management
- Dashboard insights and business analytics

### AdminPanel Key Structure

```text
AdminPanel/
  public/                  # Static assets (robots, sitemap, service worker)
  src/
    app/
      providers/           # App-level providers (state/query/theme wrappers)
    components/            # Reusable UI components
      landing/             # Landing-page specific UI blocks
      layout/              # Shared layout components
      registration/        # Auth/registration related reusable blocks
      shared/              # Generic reusable components
      ProtectedRoute.jsx   # Route guard for auth + role checks
    constants/             # App constants and shared config values
    context/
      AuthContext.jsx      # Authentication session + role context
    data/
      database.js          # Mock/sample data source
    features/
      pos/                 # POS feature module (state/UI/business logic)
    hooks/                 # Reusable custom hooks
      usePOSHotkeys.js
      useSEO.js
    layouts/
      AdminLayout.jsx      # Main authenticated dashboard shell
    pages/                 # Route-level screens/pages
      AuthPage.jsx
      Dashboard.jsx
      PosSystem.jsx
      OrdersPage.jsx
      TablesPage.jsx
      InventoryPage.jsx
      ReportsPage.jsx
      SettingsPage.jsx
      ...
    services/
      api.ts               # API service layer (typed requests in AdminPanel)
    utils/                 # Helpers and access control utilities
      access.js
      seo.js
    App.jsx                # Route definitions and app composition
    main.jsx               # React bootstrap entrypoint
    index.css              # Global styles
```

## 2) TableFrontend Purpose

`TableFrontend` is the customer experience app.

Primary responsibilities:
- Guest menu browsing
- Smooth table-side ordering flow
- Basic guest session/context handling
- User-friendly public pages and order interactions

### TableFrontend Key Structure

```text
TableFrontend/
  public/                  # Static assets (robots, sitemap, service worker)
  src/
    app/                   # App-level wrappers/providers/config scaffolding
    components/            # Reusable UI components for guest experience
    context/               # Context API state (no external state library)
    data/                  # Local/mock menu/order data sources
    hooks/                 # Guest app custom hooks
    pages/                 # Route-level customer-facing pages
    services/              # Service utilities for backend interaction
    utils/                 # Shared helper functions
    App.jsx                # Route definitions for frontend flows
    main.jsx               # React bootstrap entrypoint
    index.css              # Global styles
```

## 3) How They Work Together

- `AdminPanel` is used by the business team to configure and operate.
- `TableFrontend` is used by guests to browse and place orders.
- Operational data managed in `AdminPanel` (menu, offers, tables, etc.) is consumed by `TableFrontend` to power customer interactions.

## 4) Quick Rule of Thumb

- If a screen is for staff/business actions, it belongs in `AdminPanel/src/pages/`.
- If a screen is for customer ordering and browsing, it belongs in `TableFrontend/src/pages/`.
