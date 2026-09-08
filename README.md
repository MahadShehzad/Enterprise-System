# Acme Admin — Multi-Tenant RBAC + HR Dashboard

Enterprise-style admin dashboard: **Angular 22** SPA (standalone components,
signals, zoneless) + **ASP.NET Core 10 Web API** + **SQL Server** (EF Core).

## Architecture

```
Angular SPA (:4200)  --/api proxy-->  ASP.NET Core API (:5103)  --EF Core-->  SQL Server  (AcmeAdmin db, instance SQLEXPRESS)
```

- `src/`      — Angular front end. `DataStoreService` loads everything from
  `GET /api/bootstrap` on startup (app initializer) into signals; every edit /
  add / delete calls the matching endpoint and patches the signal from the
  server's response. `AuthService.login` posts to `/api/auth/login`.
- `server/`   — ASP.NET Core Web API. `AppDbContext` + `Seed.cs` (data mirrored
  from the old mock file). Controllers: `auth`, `bootstrap`, `employees`,
  `departments`, `meetings`, `projects`, `leave`, `users`, `tenants`.
  Migrations auto-apply on startup (`db.Database.Migrate()`).

## First-time setup

```bash
# 1. SQL Server Express must be installed and running (instance: SQLEXPRESS).
#    winget install Microsoft.SQLServer.2022.Express
# 2. EF Core CLI (once):
dotnet tool install --global dotnet-ef
# 3. Create + seed the database:
npm run db:update            # = dotnet ef database update --project server
# 4. Front-end deps:
npm install
```

Connection string lives in `server/appsettings.json`
(`Server=localhost\SQLEXPRESS;Database=AcmeAdmin;Trusted_Connection=True;...`).
Change it there if your instance name or auth differs.

## Run

```bash
npm run dev        # API (:5103) + Angular (:4200) together  -> http://localhost:4200
# or separately:
npm run api        # dotnet run --project server
npm start          # ng serve  (proxies /api to :5103)
npm run stop       # free ports 4200 + 5103 if something is stuck
```

`dev` / `start` / `api` each free their own port first (`kill-port` in a
`pre*` hook), so a leftover `ng serve` process no longer causes
"Port 4200 already in use".

## What works

- **SQL Server persistence** — all data lives in the `AcmeAdmin` database; edits,
  adds and deletes survive a page reload and are visible in SSMS. Feature toggles,
  profile edits and uploaded avatars persist too.
- **Multi-tenancy** — `Tenant` table + `TenantContextService`; every view reads
  the active tenant. Sidebar tenant selector re-brands the UI.
- **RBAC** — roles `Admin` / `Manager` / `Employee` / `Viewer` (hierarchical).
  - `AuthService` — real **email + password** login, persisted in sessionStorage.
  - `*appHasRole` structural directive hides UI per role.
  - `roleGuard` + `featureGuard` (`CanActivateFn`) block navigation -> `/app/forbidden`.
- **Central store** (`DataStoreService`) — every edit / add / delete round-trips
  to the API and reflects everywhere immediately.
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
  Meetings, Projects and attendance tables (page size 6-8, "1-10 of N" + page buttons).
- **CSV export** — real browser downloads (`Blob` + object URL, UTF-8 BOM) from
  Employees, Departments, My Team, Projects, Reports (growth / headcount / employees)
  and the Employee portal (attendance / payslips).
- **Lazy loading** — every feature is its own `loadComponent` chunk.
- **Dynamic modules** — `NavigationService` derives the menu from role **and** the
  tenant's enabled features; toggling a module in Settings updates routes + sidebar
  live.

## Demo accounts

Type one of these into the login form (email + password):

| Email                 | Password       | Role     | Lands on / can see                                   |
| --------------------- | -------------- | -------- | --------------------------------------------------- |
| mahad@acme.pk         | `admin123`     | Admin    | Everything: Departments, Employees, Projects, Meetings, Reports, Settings |
| bilal.ahmed@acme.pk   | `manager123`   | Manager  | My Team, Projects, Meetings, Employees (edit), Reports |
| imran.yousaf@acme.pk  | `employee123`  | Employee | My Attendance, My Leave, My Payslips                |
| sana.malik@acme.pk    | `viewer123`    | Viewer   | Dashboard + Reports (read-only)                     |

```bash
npm run build      # Angular production build, per-feature lazy chunks
npm test           # Angular unit tests (Vitest)
dotnet build server
```

## Structure

```
src/app/
  core/
    models/     role, tenant, user, nav-item, hr (employee/department/meeting/project/leave/attendance/payslip)
    data/       nav-catalogue.ts  (static menu config)
    services/   auth (HTTP), tenant-context, navigation, data-store (HTTP)
    guards/     auth.guard, role.guard, feature.guard
    utils/      format.ts (money, prettyDate), csv.ts (download), paginate.ts
  shared/
    directives/ has-role.directive.ts  (*appHasRole)
    ui/         button, card, stat-card (clickable), badge, sidebar, modal, paginator
  layout/shell/ sidebar + header + <router-outlet>
  features/     auth/login, dashboard, users, departments, team, projects, meetings,
                employee (portal), reports, settings, profile, forbidden
  app.routes.ts lazy routes + guards

server/
  Models/Entities.cs       EF entities
  Data/AppDbContext.cs     DbContext
  Data/Seed.cs             seed data (HasData)
  Dtos/Dtos.cs             API shapes (match the TS interfaces) + mappers
  Controllers/*.cs         REST endpoints
  Migrations/              EF Core migration (Init)
  appsettings.json         connection string
```

## Verified

- `dotnet ef database update` creates `AcmeAdmin` in SQL Server; seeded row
  counts: employees 10, departments 5, users 4, tenants 3, meetings 4,
  projects 3, leave 4, attendance 12, payslips 6.
- API: `POST /api/auth/login` returns the user; bad password -> 400.
  `GET /api/bootstrap` returns every collection with array-typed
  `enabledFeatures` / `memberIds` / `tenantIds`. Employee create -> update ->
  delete round-trips and the DB row count returns to 10.
- Headless Chrome: log in (real API) -> dashboard renders from the DB (headcount
  10, payroll PKR 3,570,000); edit an employee in the modal -> **reload the page,
  the change is still there** (re-fetched from SQL Server); `SELECT Name FROM
  Employees` confirms the write.
- `npm run build`, `npm test`, `dotnet build server` all pass.

## Deferred (not built)

- **Module Federation micro-frontends** — needs `@angular-architects/module-federation`,
  a second application, and webpack config for shell + remote.
- **Auth hardening** — passwords are compared in plain text and there is no JWT /
  session token; fine for a local demo, not production.
- **Storybook / npm-publishable `@acme/shared-ui` / axe a11y audit** — shared
  components live as app code under `src/app/shared/ui`, not a separate library.

---

See **[PROJECT_GUIDE.md](PROJECT_GUIDE.md)** for a full walkthrough — every folder,
Angular concepts, the API, how the database connects, CSS/responsive logic, and a
line-by-line trace of one feature.
