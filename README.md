# Acme Admin — Multi-Tenant RBAC + HR Dashboard

Enterprise-style Angular 22 admin dashboard built with **standalone components,
signals and zoneless change detection**. Everything is plain `.ts` / `.html` /
`.css` — no UI framework, no extra libraries.

## What works

- **Multi-tenancy** — `Tenant` model + `TenantContextService`; every data service
  reads the active tenant. Sidebar tenant selector re-brands the UI.
- **RBAC** — roles `Admin` / `Manager` / `Employee` / `Viewer` (hierarchical).
  - `AuthService` — real **email + password** login, persisted in sessionStorage.
  - `*appHasRole` structural directive hides UI per role.
  - `roleGuard` + `featureGuard` (`CanActivateFn`) block navigation → `/app/forbidden`.
- **Central mutable store** (`DataStoreService`) — every edit / add / delete is real
  and reflects everywhere immediately; state is persisted to sessionStorage.
- **Employees** (`/app/users`) — Manager can **edit**, Admin can **add / edit / delete**
  (real modal forms + confirm dialog).
- **Departments** (`/app/departments`, Admin) — headcount, per-department payroll,
  salary breakdown, add / edit departments.
- **Meetings** (`/app/meetings`, Manager + Admin) — schedule / reschedule / cancel /
  mark done your own meetings; see others' in the workspace.
- **My Team** (`/app/team`, Manager) — roster of direct reports, edit position /
  salary / status, approve / reject their leave requests.
- **Projects** (`/app/projects`, Manager + Admin) — create / edit / delete, status &
  progress, assign team members.
- **Employee portal** (`/app/me/attendance`, `/leave`, `/pay`, Employee) —
  attendance log + summary, leave balance + request form, payslip history + detail.
- **Profile** (`/app/profile`) — **upload a photo** (real `FileReader`, previewed and
  persisted), **edit** name / title / contact / bio. Photo also shows in the header.
- **Dashboard** — role-aware stat cards; **every stat card is clickable** and opens a
  detail modal with a breakdown. Quick-links panel routes by role.
- **Design** — "Autumn Harvest" palette (`#EADDC7 #DDC4A1 #D3A87A #A9805B #5D3F25
  #7C5234`) as CSS custom properties, 17px root type, and CSS motion throughout
  (page transitions, staggered entrances, hover lifts, button sheen, modal spring,
  animated login art). Every interactive element shows a pointer cursor. All motion
  respects `prefers-reduced-motion`.
- **Pagination** — reusable `ui-paginator` on the Employees, My Team, leave-approvals,
  Meetings, Projects and attendance tables (page size 6–8, "1–10 of N" + page buttons).
- **CSV export** — real browser downloads (`Blob` + object URL, UTF-8 BOM) from
  Employees, Departments, My Team, Projects, Reports (growth / headcount / employees)
  and the Employee portal (attendance / payslips).
- **Lazy loading** — every feature is its own `loadComponent` chunk.
- **Dynamic modules** — `NavigationService` derives the menu from role **and** the
  tenant's enabled features; toggling a module in Settings updates routes + sidebar
  live.

## Run

```bash
npm install
npm start          # http://localhost:4200  → redirects to /login
```

Log in with a demo account (click a row on the login screen to fill it):

| Email                 | Password       | Role     | Lands on / can see                                   |
| --------------------- | -------------- | -------- | --------------------------------------------------- |
| ayesha.khan@acme.pk   | `admin123`     | Admin    | Everything: Departments, Employees, Projects, Meetings, Reports, Settings |
| bilal.ahmed@acme.pk   | `manager123`   | Manager  | My Team, Projects, Meetings, Employees (edit), Reports |
| imran.yousaf@acme.pk  | `employee123`  | Employee | My Attendance, My Leave, My Payslips                |
| sana.malik@acme.pk    | `viewer123`    | Viewer   | Dashboard + Reports (read-only)                     |

```bash
npm run build      # production build, per-feature lazy chunks
npm test           # unit tests (Vitest)
```

## Structure

```
src/app/
  core/
    models/     role, tenant, user, nav-item, hr (employee/department/meeting/project/leave/attendance/payslip)
    data/       mock-data.ts  (Pakistani names, salaries, HR seed data)
    services/   auth, tenant-context, navigation, data-store
    guards/     auth.guard, role.guard, feature.guard
    utils/      format.ts (money, prettyDate), csv.ts (download), paginate.ts
  shared/
    directives/ has-role.directive.ts  (*appHasRole)
    ui/         button, card, stat-card (clickable), badge, sidebar, modal, paginator
  layout/shell/ sidebar + header + <router-outlet>
  features/     auth/login, dashboard, users, departments, team, projects, meetings,
                employee (portal), reports, settings, profile, forbidden
  app.routes.ts lazy routes + guards
```

## Verified (headless Chrome)

Admin edits an employee (name + salary update in the table) and deletes one
(row count 10 → 9); a dashboard stat card opens its detail modal; a meeting is
scheduled and appears in the list; a profile photo is uploaded and rendered; a
profile edit persists; Manager sees the team roster + leave approvals; Employee
lands on the portal and is redirected to `/app/forbidden` when hitting an
Admin-only route. `npm run build` and `npm test` pass.

## Deferred (not built)

- **Module Federation micro-frontends** — needs `@angular-architects/module-federation`,
  a second application, and webpack config for shell + remote.
- **Storybook / npm-publishable `@acme/shared-ui` / axe a11y audit** — shared
  components live as app code under `src/app/shared/ui`, not a separate library.
