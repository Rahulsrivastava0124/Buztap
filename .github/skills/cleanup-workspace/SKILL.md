---
name: cleanup-workspace
description: "Remove unused files, stale backups, and empty directories from the tableQR workspace. Use when: cleaning up, removing duplicate files, deleting files with ' 2' suffix, removing empty scaffolded folders, restructuring the project layout."
argument-hint: "Optional: target a specific app (AdminPanel or TableFrontend) or area (duplicates, empty-dirs)"
---

# Workspace Cleanup

Removes stale duplicate files and empty scaffolded directories from the `AdminPanel/` and `TableFrontend/` apps.

## When to Use

- Before a release or PR
- When asked to "clean up", "remove unused files", or "restructure"
- When files with ` 2` suffix are found

## Known Duplicate Files (Safe to Delete If Present)

All located in `TableFrontend/src/`:

| File                                                       | Canonical version                                        |
| ---------------------------------------------------------- | -------------------------------------------------------- |
| `src/pages/Dashboard 2.jsx`                                | `src/pages/Dashboard.jsx`                                |
| `src/pages/AuthPage 2.jsx`                                 | `src/pages/AuthPage.jsx`                                 |
| `src/context/AuthContext 2.jsx`                            | `src/context/AuthContext.jsx`                            |
| `src/components/registration/MenuUploadStep 2.jsx`         | `src/components/registration/MenuUploadStep.jsx`         |
| `src/components/registration/RegistrationModal 2.jsx`      | `src/components/registration/RegistrationModal.jsx`      |
| `src/components/registration/RegistrationReviewStep 2.jsx` | `src/components/registration/RegistrationReviewStep.jsx` |

## Empty Directories (Review Before Removing)

### AdminPanel

- `src/app/router/` — routing lives in `App.jsx`, dir is typically unused
- `src/components/ui/` — UI primitives folder may be scaffold-only
- `src/examples/` — unused scaffolding
- `src/mock/` — mock data is in `src/data/database.js` instead
- `src/types/` — TypeScript types defined in `src/services/api.ts` only
- `src/assets/` — often unused until static assets are added

Note: `src/components/layout/`, `src/components/shared/`, and `src/constants/` are currently used in this repo.

### TableFrontend

- `src/app/router/` — routing lives in `App.jsx`
- `src/components/layout/` — no layout components
- `src/examples/` — unused scaffolding
- `src/assets/` — no static assets
- `src/services/` — no API service layer yet

## Procedure

### Step 1 — Confirm before deleting

Always show the user the list of files/dirs to be removed before proceeding. Do not delete without confirmation.

### Step 2 — Delete duplicate files (if present)

```bash
# From workspace root
rm "TableFrontend/src/pages/Dashboard 2.jsx"
rm "TableFrontend/src/pages/AuthPage 2.jsx"
rm "TableFrontend/src/context/AuthContext 2.jsx"
rm "TableFrontend/src/components/registration/MenuUploadStep 2.jsx"
rm "TableFrontend/src/components/registration/RegistrationModal 2.jsx"
rm "TableFrontend/src/components/registration/RegistrationReviewStep 2.jsx"
```

### Step 3 — Verify no imports reference the deleted files

```bash
grep -r "Dashboard 2\|AuthPage 2\|AuthContext 2\|MenuUploadStep 2\|RegistrationModal 2\|RegistrationReviewStep 2" TableFrontend/src
```

Expected output: no matches.

### Step 4 — Remove confirmed-empty directories

Only remove a directory if `ls` shows it is truly empty (no hidden files):

```bash
# Example — check first
ls -la TableFrontend/src/app/router/
# Then remove only if empty
rmdir TableFrontend/src/app/router/
```

### Step 5 — Run lint to verify nothing broke

```bash
cd AdminPanel && npm run lint
cd ../TableFrontend && npm run lint
```

### Step 6 — Update AGENTS.md

Remove resolved items from the "Known Issues / Cleanup Needed" section in [AGENTS.md](../../../../AGENTS.md).
