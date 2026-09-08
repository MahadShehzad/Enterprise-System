# Acme Admin — Poora Project Samajhne Ke Liye Guide

Ye document project ke **har hissay** ko detail me samjhata hai: architecture, har
folder, Angular ke concepts, database connection, API, CSS logic, responsive
design — aur ek pura example jo click se le kar SQL Server tak trace karta hai.

---

## 0. Sab Se Pehle — Bird's Eye View

Project **3 alag alag programs** ka mel hai:

```
┌─────────────────────┐      HTTP (/api/*)      ┌──────────────────────┐    ADO.NET / TDS    ┌───────────────┐
│  Angular SPA         │ ───────────────────►   │  ASP.NET Core Web    │ ─────────────────►  │  SQL Server   │
│  (browser me chalta) │                        │  API  (C#)           │   (EF Core)         │  AcmeAdmin DB │
│  http://localhost:4200│ ◄───── JSON ────────  │  http://localhost:5103│ ◄──── rows ─────    │  SQLEXPRESS   │
└─────────────────────┘                        └──────────────────────┘                     └───────────────┘
        │                                              │                                          │
   src/ folder                                    server/ folder                          (aapke PC pe service)
   TypeScript                                     C#                                        MSSQL$SQLEXPRESS
```

| Layer | Kaam | Language | Folder |
|---|---|---|---|
| **Frontend (SPA)** | UI banata, user se interact karta, screen pe data dikhata | TypeScript / HTML / CSS | `src/` |
| **Backend (API)** | Business rules, database se baat karta, JSON return karta | C# (.NET 10) | `server/` |
| **Database** | Data ko permanently store karta (rows/tables) | SQL (T-SQL) | SQL Server engine |

**Browser kabhi bhi SQL Server se seedha baat nahi karta.** Security aur
architecture dono wajah se. Beech me API hoti hai jo:
- credentials check karti hai,
- request validate karti hai,
- database query banati hai,
- sirf safe JSON wapas bhejti hai (jaise password kabhi frontend ko nahi jaata).

---

## 1. `npm run dev` — Ye Laravel Wali Baat Nahi Hai

Aapko lagta hai `npm run dev` sirf Laravel/Vite ke liye hota hai — **aisa nahi
hai.** `npm run <name>` sirf `package.json` ke `"scripts"` block me likha hua
command chalata hai. Naam kuch bhi rakh sakte hain.

`package.json` me dekho:

```json
"scripts": {
  "start": "ng serve",
  "api":   "dotnet run --project server --launch-profile http",
  "dev":   "concurrently -k -n api,web -c blue,green \"npm:api\" \"npm:start\""
}
```

- `npm start`  → sirf Angular chalata hai (`ng serve`)
- `npm run api` → sirf C# API chalata hai (`dotnet run`)
- `npm run dev` → **`concurrently`** naam ki chhoti utility use karke **dono ek
  saath** chalata hai, ek hi terminal me, colour-coded output ke saath.
  - `-k` = agar ek process mar jaye to doosra bhi kill kar do
  - `-n api,web` = output me labels
  - `"npm:api" "npm:start"` = ye do scripts chalao

To `npm run dev` yahan bas **"do commands ek saath chalao"** ka shortcut hai.
Aap chahen to do alag terminal khol ke `npm run api` aur `npm start` bhi chala
sakte hain — bilkul same baat.

`ng serve` khud kya karta hai:
1. Angular code ko compile karta hai (TypeScript → JavaScript),
2. ek chhota dev web server chalata hai `http://localhost:4200` pe,
3. file change hote hi auto reload karta hai,
4. **`proxy.conf.json`** ko padhta hai — jo `/api/*` requests ko chupke se
   `http://localhost:5103` (C# API) pe forward kar deta hai. Isi wajah se
   frontend me hum sirf `/api/employees` likhte hain, poora URL nahi.

---

## 2. Ek Request Ki Poori Kahani (End-to-End Trace)

Maan lo aap **Employees page pe kisi employee ka "Edit" dabate ho, salary badal
ke "Save changes" karte ho.** Ye kya hota hai, step by step:

**Browser side (Angular):**

1. `users.html` me `<ui-button (pressed)="startEdit(emp)">Edit</ui-button>`
   → `UsersComponent.startEdit(emp)` chalta hai → `this.editing.set({...})`
   (ek signal) me employee ka data daal deta hai.
2. `editing()` signal change hua → template me `@if (editing(); as form)` wala
   block dikh jaata hai = modal khul gaya, form fields pre-filled.
3. Aap salary field me naya number likhte ho → `[(ngModel)]="form.salary"` us
   object me value update kar deta hai.
4. "Save changes" → `UsersComponent.saveEdit()`:
   ```ts
   this.store.updateEmployee(form.id, { salary: Number(form.salary), ... });
   ```
5. `DataStoreService.updateEmployee()`:
   ```ts
   const updated = await firstValueFrom(
     this.http.put<Employee>(`/api/employees/${id}`, { ...current, ...patch }),
   );
   this.employees.update(list => list.map(e => e.id === id ? updated : e));
   ```
   Yani: HTTP `PUT /api/employees/e2` bhejta hai, body me poora naya employee.

**Network:**

6. `ng serve` ka proxy `/api/employees/e2` ko `http://localhost:5103/api/employees/e2`
   pe forward karta hai.

**Backend side (C# API):**

7. ASP.NET Core routing dekhta hai `[Route("api/employees")]` + `[HttpPut("{id}")]`
   → `EmployeesController.Update("e2", req)` call hoti hai. `req` JSON body
   automatically `EmployeeUpsertRequest` record me deserialize ho jaata hai.
8. Controller:
   ```csharp
   var e = await db.Employees.FindAsync(id);   // SQL: SELECT ... WHERE Id='e2'
   e.Salary = req.Salary;                       // C# object update
   await db.SaveChangesAsync();                 // SQL: UPDATE Employees SET Salary=... WHERE Id='e2'
   return e.ToDto();                            // C# entity -> JSON shape
   ```
9. **EF Core** (`db.SaveChangesAsync()`) us C# object ke change ko dekhta hai
   aur khud `UPDATE` SQL statement bana ke SQL Server ko bhejta hai.

**Database:**

10. SQL Server `AcmeAdmin` database ki `Employees` table me row update ho jaati
    hai — **permanently, disk pe**.

**Wapsi (response):**

11. Controller `EmployeeDto` (JSON) return karta hai → API 200 OK + JSON.
12. `DataStoreService` wo JSON `updated` variable me le kar `this.employees`
    signal ki list me purani row ki jagah rakh deta hai.
13. `employees()` signal change → jo bhi component/template `employees()` ya us
    par bana `computed()` use kar raha tha, Angular usay **automatically
    re-render** kar deta hai (zoneless change detection).
14. Table me nayi salary dikh jaati hai. Modal band (`editing.set(null)`).
    Toast: "Saved changes to …".

Agar aap **page reload** karo:
- App dobara start hoti hai → `provideAppInitializer` → `DataStoreService.bootstrap()`
  → `GET /api/bootstrap` → API poori DB se fresh data padh ke bhejti hai →
  **salary abhi bhi nayi hai** kyunki wo SQL Server me save hui thi.

Ye poora loop samajh gaye to poora project samajh gaye.

---

## 3. Folder Structure — Har Folder Kyun Hai

```
EnterpriseSystem/
├── src/                         ← ANGULAR FRONTEND
│   ├── main.ts                  app ko browser me bootstrap karta hai
│   ├── main.server.ts           SSR ke liye (abhi client-render mode)
│   ├── server.ts                SSR express server (abhi practically off)
│   ├── styles.css               GLOBAL css: design tokens, palette, animations
│   ├── index.html               <app-root></app-root> — root HTML
│   └── app/
│       ├── app.ts / app.html    root component (bas <router-outlet/>)
│       ├── app.config.ts        DI providers: router, HttpClient, app-initializer
│       ├── app.routes.ts        saare routes + kaun sa guard lagta hai
│       ├── core/                "singletons" — poori app me ek hi instance
│       │   ├── models/          TypeScript interfaces (data ki shape)
│       │   │   ├── role.model.ts       Role type + hierarchy
│       │   │   ├── tenant.model.ts     Tenant, FeatureKey
│       │   │   ├── user.model.ts       User, UserProfile, initialsOf()
│       │   │   ├── nav-item.model.ts   sidebar item ki shape
│       │   │   └── hr.model.ts         Employee, Department, Meeting, Project…
│       │   ├── data/
│       │   │   └── nav-catalogue.ts    static menu config (data nahi, config)
│       │   ├── services/        business logic + state (Injectable classes)
│       │   │   ├── auth.service.ts        login, current user, roles
│       │   │   ├── data-store.service.ts  saara data API se load + mutate
│       │   │   ├── tenant-context.service.ts  active tenant + feature toggles
│       │   │   └── navigation.service.ts  role+tenant se menu banata
│       │   ├── guards/          route ke aage "darbaan" (CanActivateFn)
│       │   │   ├── auth.guard.ts     login hai ke nahi
│       │   │   ├── role.guard.ts     role allowed hai ke nahi
│       │   │   └── feature.guard.ts  tenant ne module enable kiya hai ke nahi
│       │   └── utils/           pure helper functions (koi state nahi)
│       │       ├── format.ts    money(), prettyDate()
│       │       ├── csv.ts       CSV banao + browser download
│       │       └── paginate.ts  array ko page-wise slice karo
│       ├── shared/              reusable UI, poori app me use hota
│       │   ├── directives/
│       │   │   └── has-role.directive.ts   *appHasRole
│       │   └── ui/              chhote "dumb" components (button, card…)
│       │       ├── button/  card/  badge/  stat-card/
│       │       ├── sidebar/  modal/  paginator/  data-table/
│       ├── layout/
│       │   └── shell/           sidebar + header + <router-outlet> ka frame
│       └── features/            har page apna folder (feature-based)
│           ├── auth/login/
│           ├── dashboard/
│           ├── users/           (Employees page)
│           ├── departments/  team/  projects/  meetings/
│           ├── employee/        employee portal (attendance/leave/pay)
│           ├── reports/  settings/  profile/  forbidden/
│
├── server/                      ← ASP.NET CORE API (C#)
│   ├── Program.cs               app startup: DI, CORS, EF, migrations
│   ├── appsettings.json         connection string yahan
│   ├── Models/Entities.cs       DB tables ki C# shape
│   ├── Data/
│   │   ├── AppDbContext.cs      EF Core ka "database session" object
│   │   └── Seed.cs              shuru ka demo data
│   ├── Dtos/Dtos.cs             API ki JSON shapes + entity→dto mappers
│   ├── Controllers/*.cs         REST endpoints
│   └── Migrations/              EF ne jo SQL schema banaya (version-controlled)
│
├── proxy.conf.json              /api → localhost:5103 (dev only)
├── angular.json                 Angular CLI config (build/serve settings)
├── package.json                 npm scripts + frontend dependencies
└── PROJECT_GUIDE.md             ye file
```

### Folder structure aisa kyun? ("feature-based" architecture)

Do common tareeke hote hain:

**(A) Type ke hisaab se** — saare components ek folder me, saare services ek
folder me:
```
components/  services/  models/  pipes/       ← chhoti apps ke liye theek
```

**(B) Feature ke hisaab se** (jo humne use kiya) — har screen/feature apna
self-contained folder:
```
features/users/    users.ts  users.html  users.css
features/reports/   reports.ts reports.html reports.css
```

Humne (B) isliye chuna:
- **App bari hai** (12+ features). Type-based me `components/` folder me 40+
  files ho jaati.
- **Ek feature pe kaam karna asaan** — Employees page change karna hai to bas
  `features/users/` kholo, sab kuch wahin hai.
- **Lazy loading natural** — har feature folder = ek alag JS chunk jo sirf tab
  download hota hai jab user us page pe jaata hai.
- **Team scaling** — 2 log alag features pe bina conflict ke kaam kar sakte.

`core/` vs `shared/` ka farq:
- `core/` = **poori app me ek hi baar**, state rakhne wali cheezein (services,
  guards). Inka ek hi instance hota hai (singleton).
- `shared/` = **kai jagah copy hoke** use hone wali "dumb" cheezein (button,
  card). Inke bohot saare instances hote hain, koi state nahi.

---

## 4. Angular Ke Building Blocks Jo Yahan Use Hue

### 4.1 Standalone Components (koi NgModule nahi)

Purana Angular `@NgModule` use karta tha. Naya Angular (v17+) **standalone**:
har component apni dependencies khud declare karta hai `imports:` me.

```ts
@Component({
  selector: 'app-users',
  imports: [FormsModule, CardComponent, ButtonComponent, ModalComponent, ...],
  templateUrl: './users.html',
  styleUrl: './users.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent { ... }
```

- `selector` — HTML tag ka naam (`<app-users>`)
- `imports` — is template me kaun se components/directives use ho rahe
- `templateUrl` / `styleUrl` — HTML aur CSS alag files me
- `changeDetection: OnPush` — performance: Angular sirf tab check kare jab
  inputs ya signals change hon

### 4.2 Signals — reactive state ka naya tareeka

Signal ek **box** hai jisme value hoti hai, aur jab value badalti hai to jo bhi
us box ko padh raha tha, wo automatically update ho jaata hai.

```ts
const count = signal(0);     // banaya
count();                     // padha  → 0
count.set(5);                // likha
count.update(n => n + 1);    // purani value se nayi

const doubled = computed(() => count() * 2);   // derived — count change hote hi khud recalc
```

Is project me **saara state signals me hai**:
- `DataStoreService.employees` = `signal<Employee[]>([])`
- `AuthService.user` = `signal<User | null>(...)`
- Component ke local `editing`, `page`, `toast` — sab signals

Template me `{{ employees() }}` ya `@if (editing())` likhte ho — jab signal
change hoga, sirf wo DOM part re-render hoga.

### 4.3 Zoneless Change Detection

Purana Angular `zone.js` use karta tha jo har `setTimeout`, har click, har HTTP
ke baad **poori app** check karta tha (slow). Ye project **zoneless** hai —
`zone.js` bilkul nahi. Angular ko pata chalta hai kab re-render karna hai kyunki
**signals khud bata dete hain**. Isliye `package.json` me `zone.js` dependency
nahi hai.

### 4.4 Dependency Injection — `inject()`

Services ko `new` se nahi banate. Angular ek "container" rakhta hai jisme ek hi
instance hota hai, aur `inject()` se maang lete ho:

```ts
export class UsersComponent {
  private readonly tenantCtx = inject(TenantContextService);
  protected readonly store = inject(DataStoreService);
}
```

`@Injectable({ providedIn: 'root' })` matlab: is service ka **ek global
instance** banao, jisko bhi chahiye milega. Isi wajah se `DataStoreService` ka
data poori app me share hota hai.

### 4.5 Routing + Lazy Loading

`app.routes.ts`:

```ts
{
  path: 'users',
  title: 'Employees · Acme Admin',
  canActivate: [roleGuard, featureGuard],              // darbaan
  data: { allowedRoles: ['Manager', 'Admin'], feature: 'users' },
  loadComponent: () =>                                  // LAZY: sirf tab download
    import('./features/users/users').then(m => m.UsersComponent),
}
```

- `loadComponent: () => import(...)` — Employees ka code alag file me build hota
  hai, browser use tab download karta hai jab user pehli baar `/app/users` pe
  jaata hai. `ng build` output me dikhta hai: `chunk-...js | users`.
- `canActivate: [roleGuard, featureGuard]` — navigate karne se pehle ye
  functions chalte hain, `true` de to andar jaao, `UrlTree` de to redirect.
- `data: {...}` — guard ke liye config. `withComponentInputBinding()` (config me)
  ki wajah se `data` ki keys component ke `input()` me bhi bind ho jaati hain
  (employee portal `tab` isi tarah aata hai).

### 4.6 Guards — route ke darbaan

`CanActivateFn` ek function hai jo `true` / `false` / `UrlTree` return karta:

```ts
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  return router.createUrlTree(['/login'], { queryParams: { redirectTo: state.url } });
};
```

3 guards:
- `authGuard` — login hai? nahi → `/login`
- `roleGuard` — `data.allowedRoles` me current role hai? nahi → `/app/forbidden`
- `featureGuard` — active tenant ne `data.feature` module enable kiya hai? nahi
  → `/app/forbidden`

### 4.7 Structural Directive — `*appHasRole`

`has-role.directive.ts` — ye element ko role ke hisaab se dikhata/chhupata hai:

```html
<ui-button *appHasRole="'Admin'" variant="danger">Delete</ui-button>
```

`*` matlab "structural" — ye element ko DOM se add/remove karta hai (sirf CSS se
hide nahi). Andar `effect()` chalta hai jo `auth` role signal ko watch karta:

```ts
constructor() {
  effect(() => {
    const permitted = this.auth.hasAnyRole(this.normalise(this.appHasRole()));
    if (permitted && !this.rendered) { this.vcr.createEmbeddedView(this.tpl); this.rendered = true; }
    else if (!permitted && this.rendered) { this.vcr.clear(); this.rendered = false; }
  });
}
```

- `TemplateRef` = wo HTML jo `*` ke saath likha
- `ViewContainerRef` = jagah jahan wo HTML render hoga
- Role change → effect dobara chalta → view add/remove

**Do layer security:** `*appHasRole` UI se button hata deta hai, aur `roleGuard`
+ API dono milke pakka karte hain ke chhupa hua route/action bhi na chale.

### 4.8 `effect()`

`effect()` ek function hai jo **jab bhi uske andar padha gaya koi signal
change ho**, dobara chalta hai. Side-effects ke liye (DOM manipulate karna,
localStorage likhna, etc.):

```ts
// tenant-context.service.ts — active tenant badle to CSS variable update
effect(() => {
  const tenant = this.activeTenant();
  this.doc.documentElement.style.setProperty(
    '--color-brand', tenant?.branding.primary ?? 'var(--c-clay)',
  );
});
```

---

## 5. Frontend Data Layer — `DataStoreService` (dil)

Ye service **poore frontend ka single source of truth** hai. Isme:

**Signals (state):**
```ts
readonly tenants     = signal<Tenant[]>([]);
readonly departments = signal<Department[]>([]);
readonly employees   = signal<Employee[]>([]);
readonly meetings    = signal<Meeting[]>([]);
readonly projects    = signal<Project[]>([]);
readonly leave       = signal<LeaveRequest[]>([]);
readonly attendance  = signal<AttendanceRecord[]>([]);
readonly payslips    = signal<Payslip[]>([]);
readonly loaded      = signal(false);
```

**Bootstrap (shuru me sab load):**
```ts
private async load(): Promise<void> {
  const data = await firstValueFrom(this.http.get<BootstrapResponse>('/api/bootstrap'));
  this.tenants.set(data.tenants);
  this.employees.set(data.employees);
  // ... baaki sab
  this.loaded.set(true);
}
```
`bootstrap()` sirf ek baar chalta hai (promise cache hoti hai). Ye
`app.config.ts` me `provideAppInitializer` se call hota hai — **app render hone
se pehle**, taake guards ko tenant/feature data mil jaye.

**Har mutation ka pattern (bilkul same, sab methods me):**
```ts
async updateEmployee(id, patch) {
  const current = this.employeeById(id);
  const updated = await firstValueFrom(
    this.http.put<Employee>(`/api/employees/${id}`, { ...current, ...patch }),  // 1. API ko bhejo
  );
  this.employees.update(list => list.map(e => e.id === id ? updated : e));       // 2. signal patch karo
}
```

Har method: **API call karo → jo server ne wapas bheja usse local signal update
karo**. Kabhi bhi local signal ko API ke bina change nahi karte — is se UI aur
DB kabhi out of sync nahi hote.

Components in signals ko **read-only** treat karte hain aur mutation ke liye
in methods ko call karte hain. Example (`users.ts`):
```ts
this.store.updateEmployee(form.id, { salary: ..., name: ... });
this.store.deleteEmployee(emp.id);
this.store.addEmployee({ ... });
```

---

## 6. Auth Flow

`auth.service.ts`:

1. **Login:** `login(email, password)` → `POST /api/auth/login` → API SQL Server
   me user dhoondti, password check karti, user (bina password) wapas bhejti.
   ```ts
   const user = await firstValueFrom(this.http.post<User>('/api/auth/login', { email, password }));
   this._user.set(user);
   ```
2. **Persist:** ek `effect()` `_user` signal ko watch karta aur `sessionStorage`
   me JSON likhta. Page refresh pe `restore()` usse wapas padh leta — dobara
   login nahi karna parta (session tab band hone tak).
3. **Role checks:**
   ```ts
   hasMinRole('Manager')            // hierarchical: Admin(4) >= Manager(3) ✓
   hasAnyRole(['Manager','Admin'])   // exact list me hai?
   ```
   `role.model.ts` me `ROLE_RANK = { Viewer:1, Employee:2, Manager:3, Admin:4 }`.
4. **Profile / avatar edit:** `PUT /api/users/{id}/profile` aur
   `/api/users/{id}/avatar` — DB me save, phir `_user` signal update.

---

## 7. The API — `server/` (ASP.NET Core + EF Core)

### 7.1 `Program.cs` — startup

```csharp
builder.Services.AddControllers();                              // controllers on karo

builder.Services.AddDbContext<AppDbContext>(opt =>              // EF Core register
    opt.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddCors(o => o.AddPolicy("spa", p => p         // browser ko allow karo
    .WithOrigins("http://localhost:4200").AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

using (var scope = app.Services.CreateScope())                  // startup pe migrations apply
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();          // agar DB ya tables nahi hain, bana do
}

app.UseCors("spa");
app.MapControllers();
app.Run();
```

- **CORS** kyun? Browser security rule: `localhost:4200` se `localhost:5103` pe
  request "cross-origin" hai. API ko explicitly bolna parta hai "haan is origin
  ko allow karo". (`ng serve` proxy ke through same-origin lagta hai, phir bhi
  safety ke liye rakha hai.)
- `db.Database.Migrate()` — is line ki wajah se aapko manually `dotnet ef
  database update` chalane ki zaroorat nahi, API khud DB bana leti hai.

### 7.2 Controllers — REST endpoints

```csharp
[ApiController]
[Route("api/employees")]                          // base URL
public class EmployeesController(AppDbContext db) : ControllerBase
{
    [HttpGet]                                     // GET /api/employees
    public async Task<IEnumerable<EmployeeDto>> GetAll() =>
        (await db.Employees.AsNoTracking().ToListAsync()).Select(e => e.ToDto());

    [HttpPost]                                     // POST /api/employees
    public async Task<ActionResult<EmployeeDto>> Create(EmployeeUpsertRequest req) { ... }

    [HttpPut("{id}")]                              // PUT /api/employees/e2
    public async Task<ActionResult<EmployeeDto>> Update(string id, EmployeeUpsertRequest req) { ... }

    [HttpDelete("{id}")]                           // DELETE /api/employees/e2
    public async Task<IActionResult> Delete(string id) { ... }
}
```

- `(AppDbContext db)` — **primary constructor**, DI se `db` inject hota (bilkul
  Angular ke `inject()` jaisa concept).
- `EmployeeUpsertRequest req` — request ka JSON body automatically C# record me
  convert (deserialize) hota.
- `AsNoTracking()` — read-only query, EF ko changes track nahi karne (fast).
- Return `EmployeeDto` — C# object automatically JSON me serialize hota
  (camelCase: `departmentId`, `managerId`…).

Saare controllers: `AuthController`, `BootstrapController`, `EmployeesController`,
`DepartmentsController`, `MeetingsController`, `ProjectsController`,
`LeaveController`, `UsersController`, `TenantsController`.

`BootstrapController` sab kuch ek request me deta (SPA startup fast):
```csharp
[HttpGet]  // GET /api/bootstrap
public async Task<ActionResult<BootstrapDto>> Get() => new BootstrapDto(
    (await db.Tenants.ToListAsync()).Select(x => x.ToDto()),
    (await db.Departments.ToListAsync()).Select(x => x.ToDto()),
    ... );
```

### 7.3 DTOs vs Entities — do alag shapes kyun?

- **Entity** (`Models/Entities.cs`) = DB table ki exact copy. Isme
  `Password` field hai, `EnabledFeatures` ek **CSV string** hai
  (`"dashboard,users,reports"`), kyunki SQL me array nahi hota.
- **DTO** (`Dtos/Dtos.cs`) = jo JSON frontend ko chahiye. Isme `Password`
  **nahi** hai, `EnabledFeatures` ek proper **array** hai `["dashboard","users"]`.

Mapper beech me convert karta:
```csharp
public static TenantDto ToDto(this Tenant t) =>
    new(t.Id, t.Name,
        new BrandingDto(t.BrandingPrimary, t.BrandingShortName),
        Csv(t.EnabledFeatures));   // "a,b,c" → ["a","b","c"]
```

**Faida:** DB structure aur API contract alag rakhe. DB me column add karo to
API automatically change nahi hoti (aur ulta).

### 7.4 EF Core — ye kya hai

**Entity Framework Core** ek **ORM** hai (Object-Relational Mapper). Matlab: aap
C# objects se kaam karte ho, EF beech me **SQL likhta hai**:

| Aap likhte ho (C#/LINQ) | EF ye SQL bhejta hai |
|---|---|
| `db.Employees.ToListAsync()` | `SELECT * FROM Employees` |
| `db.Employees.FindAsync("e2")` | `SELECT * FROM Employees WHERE Id = 'e2'` |
| `e.Salary = 500000; db.SaveChangesAsync();` | `UPDATE Employees SET Salary = 500000 WHERE Id = 'e2'` |
| `db.Employees.Add(e); db.SaveChangesAsync();` | `INSERT INTO Employees (...) VALUES (...)` |
| `db.Employees.Remove(e); db.SaveChangesAsync();` | `DELETE FROM Employees WHERE Id = 'e2'` |

`AppDbContext` = database ke saath ek "session". `DbSet<Employee> Employees`
= `Employees` table.

### 7.5 Migrations — schema version control

Aapne kabhi manually `CREATE TABLE` nahi likha. EF ne apki entity classes dekh
kar khud SQL schema banaya:

```
dotnet ef migrations add Init     ← EF ne Migrations/20260908075554_Init.cs banaya
                                     (isme CREATE TABLE + seed INSERT ka C# code)
dotnet ef database update         ← wo code SQL Server pe chalaya → DB ban gayi
```

`Migrations/` folder git me commit hai. Kisi aur PC pe bas `dotnet ef database
update` chalao, wahi schema ban jaayega. `__EFMigrationsHistory` table track
karti hai kaun si migrations apply ho chuki hain.

### 7.6 Seed — shuru ka data

`Data/Seed.cs` me `HasData(...)` — EF migration ke saath ye rows bhi
`INSERT` kar deta hai (purane mock-data.ts se copy kiya hua):
```csharp
b.Entity<Tenant>().HasData(
    new Tenant { Id = "orient", Name = "Orient Textiles", ... },
    ...);
```

---

## 8. Database Connection — Poori Tafseel

### 8.1 Connection string (`server/appsettings.json`)

```json
"ConnectionStrings": {
  "Default": "Server=localhost\\SQLEXPRESS;Database=AcmeAdmin;Trusted_Connection=True;TrustServerCertificate=True;Encrypt=False"
}
```

Har hissa:

| Part | Matlab |
|---|---|
| `Server=localhost\SQLEXPRESS` | Kis machine + kaun sa SQL Server **instance**. `SQLEXPRESS` = Express edition ka default instance naam. (`\\` C# me `\` likhne ka tareeka.) |
| `Database=AcmeAdmin` | Kaun si database use karni |
| `Trusted_Connection=True` | **Windows Authentication** — alag username/password nahi, aapka Windows login use hota. (Aap ne SQL install kiya to aap sysadmin ho.) |
| `TrustServerCertificate=True` | Dev me SQL Server ki SSL certificate self-signed hoti, usko trust karo |
| `Encrypt=False` | Local dev, encryption ki zaroorat nahi |

### 8.2 Connection banti kaise hai (flow)

1. `Program.cs` → `opt.UseSqlServer(connectionString)` — EF ko batata SQL Server
   use karna, aur kahan.
2. Jab pehli baar `db.Employees.ToListAsync()` chalta, EF **connection pool** se
   ek connection leta (ya nayi banata):
   - `Microsoft.Data.SqlClient` driver TDS protocol pe SQL Server se connect
     karta (`localhost\SQLEXPRESS` = named pipe / shared memory locally).
   - Windows auth → aapka Windows token bhejta, SQL Server verify karta.
3. Query chalti, rows aate, EF unhe `Employee` objects me convert karta.
4. Connection wapas pool me chala jaata (band nahi hota — reuse ke liye).

**Aapne kabhi manually connect/disconnect nahi likha** — EF + connection pooling
sab automatic hai.

### 8.3 SQL Server engine

- Ye ek **Windows service** hai: `MSSQL$SQLEXPRESS`, PC ke saath auto-start.
- Data `C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\DATA\`
  me `.mdf` (data) + `.ldf` (log) files me store hota.
- Dekhne ke liye: **SSMS** (SQL Server Management Studio) ya **Azure Data Studio**
  install karke `localhost\SQLEXPRESS` se connect karo (Windows auth).
- CLI se: `sqlcmd -S "localhost\SQLEXPRESS" -d AcmeAdmin -E -Q "SELECT * FROM Employees"`

---

## 9. HTML Se Zyada TypeScript Pe Focus Kyun?

Ye **framework ki philosophy** hai, meri choice nahi. Angular (aur React, Vue)
sab **"logic TS/JS me, template sirf declarative binding"** model follow karte.

**HTML template ka kaam sirf itna:** "ye data yahan dikhao, ye event hone pe ye
method call karo". Koi `if/else`, loop, calculation template me **minimal**:

```html
<!-- template: sirf structure + binding -->
<td>{{ money(emp.salary) }}</td>
<ui-button (pressed)="startEdit(emp)">Edit</ui-button>
@for (emp of pageItems(); track emp.id) { <tr>...</tr> }
@if (editing(); as form) { <ui-modal>...</ui-modal> }
```

**Saara asal kaam TS me:**
```ts
// component: sara logic
protected readonly pageItems = computed(() =>
  paginate(this.people(), this.page(), this.pageSize));   // kaunsi rows dikhani

saveEdit(): void {
  if (!form.name.trim()) return;                          // validation
  this.store.updateEmployee(form.id, {...});              // API call
  this.toast.set('Saved');                                // feedback
}
```

**Faida:**
- Logic **testable** hai (TS function ka unit test likh sakte, HTML ka nahi).
- Types se **compile-time pe** galti pakri jaati (`emp.salery` likha to build fail).
- Template chhota, padhne me asaan — "ye kya dikhata" ek nazar me.
- Reusability — same logic alag templates ke saath use ho sakta.

**Ratio approx:** har feature me `.ts` ~60%, `.html` ~25%, `.css` ~15% —
kyunki dimaag TS me hai.

---

## 10. CSS Architecture — Logic Aisi Kyun

### 10.1 Design Tokens (CSS Custom Properties)

`src/styles.css` ke top pe **ek jagah** saare colours/spacing define:

```css
:root {
  /* raw palette — "Autumn Harvest" */
  --c-cream: #eaddc7;
  --c-sand:  #ddc4a1;
  --c-tan:   #d3a87a;
  --c-clay:  #a9805b;
  --c-cocoa: #5d3f25;
  --c-bark:  #7c5234;

  /* semantic tokens — component in naamon se use karte */
  --color-ink:     #3b2a1b;   /* text */
  --color-mist:    #f7f1e8;   /* page background */
  --color-surface: #ffffff;   /* card background */
  --color-border:  #e7d8c0;

  /* gradients */
  --gradient-brand: linear-gradient(160deg, var(--c-clay-600), var(--c-clay-800));

  /* layout */
  --sidebar-width: 268px;
  --radius-md: 12px;
  --shadow-md: 0 10px 30px rgba(59,42,27,.14);

  /* motion */
  --ease-out: cubic-bezier(.22, 1, .36, 1);

  font-size: 17px;   /* poori app ka base — user ne "font bara karo" kaha tha */
}
```

**Faida:** poora theme badalna hai? Bas ye 20 lines change karo, poori app
badal jaati. Component CSS me kabhi hardcoded `#a9805b` nahi likha —
hamesha `var(--c-clay)`.

Aapne 2 baar palette change karwaya (mauve → autumn) — **sirf `styles.css` ke
tokens change hue**, 30+ component files ko haath nahi lagana pada. Yahi is
approach ka pura point hai.

### 10.2 Tenant branding — runtime CSS variable

`tenant-context.service.ts` ka `effect()` active tenant ke hisaab se
`--color-brand` set karta:
```ts
this.doc.documentElement.style.setProperty('--color-brand', tenant.branding.primary);
```
To tenant switch karo → jahan `var(--color-brand)` use hua, sab live badal jaata.

### 10.3 Component-scoped CSS

Har component ka `.css` **sirf usi component pe apply** hota (Angular har
element pe ek unique attribute laga deta, jaise `_ngcontent-abc`). To
`users.css` ka `.toast` `reports.css` ke `.toast` se collide nahi karta.

Global cheezein (`.page`, `.card` layout, `.btn` nahi — wo component hai) aur
shared table styles `styles.css` me hain kyunki multiple features same
`<table class="table">` markup use karte.

### 10.4 Animations — global keyframes, CSS-only

`styles.css` me `@keyframes` (global — component CSS inhe naam se use kar sakti):
```css
@keyframes fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
@keyframes modal-in { ... }
@keyframes sheen { ... }

@media (prefers-reduced-motion: reduce) {   /* accessibility: jinhe motion se dikkat */
  *, *::before, *::after {
    animation-duration: .001ms !important;
    transition-duration: .001ms !important;
  }
}
```

Component me:
```css
.page       { animation: page-enter .5s var(--ease-out) both; }   /* har route change pe */
:host       { animation: fade-up .5s var(--ease-out) both; }       /* card mount pe */
.grid--stats > *:nth-child(2) { animation-delay: .11s; }           /* staggered */
.btn::after { /* hover pe "sheen" sweep */ }
```

**JavaScript animation library nahi** (`@angular/animations` bhi nahi) — pure
CSS. Halka, fast, aur "industrial" feel deta.

### 10.5 Responsive Logic

3 main techniques:

**(a) Fluid values — `clamp()`**
```css
.page { padding: 2rem clamp(1rem, 3.5vw, 2.75rem); }
```
`clamp(min, preferred, max)` — chhoti screen pe `1rem`, bari pe `2.75rem`,
beech me viewport ke hisaab se smooth. **Media query ki zaroorat nahi.**

**(b) Auto-fit grid — content khud wrap hota**
```css
.grid--stats { grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); }
```
"Jitni 230px+ ki columns fit ho sakti, utni banao, baaki neeche". 4 stat cards
desktop pe ek row, tablet pe 2×2, mobile pe stack — **bina koi breakpoint likhe**.

**(c) Breakpoints — jab structure hi badalna ho**
```css
@media (max-width: 820px) {
  .shell            { flex-direction: column; }   /* sidebar upar aa jaye */
  .shell__sidebar   { position: static; width: 100%; }
  .shell__user-name { display: none; }            /* chhoti screen pe naam hide */
}
```
Sirf tab use kiya jab layout ka **structure** badalna ho (row → column), ya
kuch cheez chhupani ho. Colours/spacing ke liye `clamp` + tokens kaafi.

**Overflow rule:** wide cheezein (tables) apne container me scroll hoti,
page kabhi horizontal scroll nahi karta:
```css
.table-wrap { overflow-x: auto; }
```

---

## 11. Line-by-Line: Ek Feature (`features/users/`)

### `users.ts` (component class)

```ts
@Component({
  selector: 'app-users',
  imports: [FormsModule, CardComponent, ButtonComponent, BadgeComponent,
            ModalComponent, PaginatorComponent, HasRoleDirective],
  templateUrl: './users.html',
  styleUrl: './users.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent {
  private readonly tenantCtx = inject(TenantContextService);   // DI
  protected readonly store = inject(DataStoreService);          // protected = template me use hoga

  protected readonly roles = ALL_ROLES;                         // dropdown options
  protected readonly statuses: EmployeeStatus[] = ['Active','Invited','Suspended'];
  protected readonly money = money;                             // helper ko template me expose

  // active tenant ke departments — computed, tenant ya data change hote hi khud update
  protected readonly departments = computed(() =>
    this.store.departments().filter(d => d.tenantId === this.tenantCtx.activeTenant()?.id));

  // active tenant ke employees
  protected readonly people = computed(() =>
    this.store.employees().filter(e => e.tenantId === this.tenantCtx.activeTenant()?.id));

  protected readonly pageSize = 8;
  protected readonly page = signal(1);                          // konsa page dikh raha
  protected readonly pageItems = computed(() =>                 // sirf is page ki 8 rows
    paginate(this.people(), this.page(), this.pageSize));

  // modal state: null = band, {id:null} = "add", {id:'e2'} = "edit"
  protected readonly editing = signal<(EmployeeForm & { id: string | null }) | null>(null);
  protected readonly deleting = signal<Employee | null>(null);  // delete confirm modal
  protected readonly toast = signal('');                        // "Saved!" message

  exportCsv(): void {
    exportCsv(`employees-${tenant}`, this.people(), [            // csv util
      { header: 'Name',  value: e => e.name },
      { header: 'Email', value: e => e.email },
      ...]);
  }

  startEdit(emp: Employee): void {
    this.editing.set({ id: emp.id, name: emp.name, ... });      // form ko pre-fill
  }

  saveEdit(): void {
    const form = this.editing();
    if (!form || !form.name.trim() || !form.email.trim()) return;   // validation
    if (form.id) {
      this.store.updateEmployee(form.id, { name: ..., salary: Number(form.salary) });  // API
      this.toast.set(`Saved changes to ${form.name}.`);
    } else {
      this.store.addEmployee({ ..., managerId: null, joinedAt: today, tenantId });
      this.toast.set(`Added ${form.name}.`);
      this.page.set(1);
    }
    this.editing.set(null);                                     // modal band
    setTimeout(() => this.toast.set(''), 3000);                 // 3s baad toast hatao
  }

  confirmDelete(): void {
    const emp = this.deleting();
    if (!emp) return;
    this.store.deleteEmployee(emp.id);                          // API
    this.toast.set(`Removed ${emp.name}.`);
    this.deleting.set(null);
  }
}
```

### `users.html` (template)

```html
<div class="page">
  <header class="page__header users__header">
    <div>
      <h1 class="page__title">Employees</h1>
      <p class="page__subtitle">Directory for the active tenant. Managers can edit; Admins can add and remove.</p>
    </div>
    <div class="row-actions">
      <ui-button variant="ghost" (pressed)="exportCsv()">Export CSV</ui-button>
      <span *appHasRole="'Admin'">                              <!-- sirf Admin ko dikhta -->
        <ui-button (pressed)="startAdd()">Add employee</ui-button>
      </span>
    </div>
  </header>

  @if (toast()) { <p class="users__toast" role="status">{{ toast() }}</p> }   <!-- toast tab dikhe jab text ho -->

  <ui-card [padded]="false">
    <div class="table-wrap">
      <table class="table">
        <thead><tr>
          <th>Name</th><th>Email</th><th>Department</th><th>Role</th><th>Status</th>
          <th class="ta-end" *appHasRole="['Manager','Admin']">Salary</th>   <!-- salary sirf Manager+ -->
          <th class="ta-end">Actions</th>
        </tr></thead>
        <tbody>
          @for (emp of pageItems(); track emp.id) {              <!-- sirf current page -->
            <tr>
              <td class="strong">{{ emp.name }}</td>
              <td>{{ emp.email }}</td>
              <td>{{ deptName(emp.departmentId) }}</td>
              <td>{{ emp.role }}</td>
              <td>
                <ui-badge [tone]="emp.status === 'Active' ? 'success'
                                : emp.status === 'Invited' ? 'warning' : 'danger'">
                  {{ emp.status }}
                </ui-badge>
              </td>
              <td class="ta-end" *appHasRole="['Manager','Admin']">{{ money(emp.salary) }}</td>
              <td class="ta-end">
                <div class="users__row-actions">
                  <ui-button *appHasRole="['Manager','Admin']" variant="ghost"
                             (pressed)="startEdit(emp)">Edit</ui-button>
                  <ui-button *appHasRole="'Admin'" variant="danger"
                             (pressed)="deleting.set(emp)">Delete</ui-button>
                </div>
              </td>
            </tr>
          } @empty {
            <tr><td class="table__empty" colspan="7">No employees in this tenant.</td></tr>
          }
        </tbody>
      </table>
    </div>
    <ui-paginator [total]="people().length" [pageSize]="pageSize" [(page)]="page" />
  </ui-card>
</div>

<!-- EDIT / ADD MODAL — sirf tab render jab editing() truthy ho -->
@if (editing(); as form) {
  <ui-modal [title]="form.id ? 'Edit employee' : 'Add employee'" (closed)="editing.set(null)">
    <form class="form" (ngSubmit)="saveEdit()">
      <div class="form__row">
        <label class="field">
          <span class="field__label">Full name</span>
          <input class="input" name="name" [(ngModel)]="form.name" required />
        </label>
        <label class="field">
          <span class="field__label">Email</span>
          <input class="input" name="email" type="email" [(ngModel)]="form.email" required />
        </label>
      </div>
      <!-- ... position / department / role / status / salary / phone / location ... -->
    </form>
    <div modalFooter>
      <ui-button variant="ghost" (pressed)="editing.set(null)">Cancel</ui-button>
      <ui-button (pressed)="saveEdit()">{{ form.id ? 'Save changes' : 'Add employee' }}</ui-button>
    </div>
  </ui-modal>
}
```

**Binding syntax:**

| Syntax | Matlab |
|---|---|
| `{{ x }}` | text interpolation — signal/property ki value dikhao |
| `[prop]="x"` | property binding — child ko value do (`[total]="people().length"`) |
| `(event)="fn()"` | event binding — event pe method chalao (`(pressed)="startEdit(emp)"`) |
| `[(ngModel)]="x"` | two-way — input ↔ property dono taraf sync |
| `[class.foo]="cond"` | conditional CSS class |
| `@if` `@for` `@empty` | Angular control flow (naya syntax, `*ngIf` ki jagah) |
| `*appHasRole="..."` | structural directive — element add/remove |
| `#name` | template reference variable |

---

## 12. Line-by-Line: Ek Controller + DbContext

### `EmployeesController.Update`

```csharp
[HttpPut("{id}")]                                      // PUT /api/employees/{id}
public async Task<ActionResult<EmployeeDto>> Update(string id, EmployeeUpsertRequest req)
{
    var e = await db.Employees.FindAsync(id);          // SELECT * FROM Employees WHERE Id=@id
    if (e is null) return NotFound();                  // 404 agar exist nahi karta

    e.Name       = req.Name.Trim();                    // C# object ke fields update
    e.Email      = req.Email.Trim();
    e.Role       = req.Role;
    e.Status     = req.Status;
    e.Position   = req.Position;
    e.DepartmentId = req.DepartmentId;
    e.ManagerId  = req.ManagerId;
    e.Salary     = req.Salary;
    e.Phone      = req.Phone;
    e.Location   = req.Location;

    await db.SaveChangesAsync();                       // EF: UPDATE Employees SET ... WHERE Id=@id
    return e.ToDto();                                  // entity → JSON DTO, 200 OK
}
```

`FindAsync` se aaya object EF **track** karta hai. Aap uske fields change karte
ho, `SaveChangesAsync()` pe EF compare karta "kya kya badla" aur sirf wahi
columns ka `UPDATE` bhejta.

### `AppDbContext`

```csharp
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Tenant> Tenants     => Set<Tenant>();     // har DbSet = ek table
    public DbSet<AppUser> Users      => Set<AppUser>();
    public DbSet<Employee> Employees => Set<Employee>();
    // ...

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Employee>().HasKey(x => x.Id);            // primary key
        // ...
        Seed.Apply(b);                                     // demo rows
    }
}
```

### `Models/Entities.cs` (ek entity)

```csharp
public class Employee
{
    public string Id { get; set; } = "";                  // PK — "e1", "e2", ya nayi "e-<guid>"
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string Role { get; set; } = "";
    public string Status { get; set; } = "";
    public string Position { get; set; } = "";
    public string DepartmentId { get; set; } = "";
    public string? ManagerId { get; set; }                // ? = nullable (boss ho bhi na bhi)
    public int Salary { get; set; }
    public string Phone { get; set; } = "";
    public string Location { get; set; } = "";
    public string JoinedAt { get; set; } = "";            // ISO date string
    public string TenantId { get; set; } = "";
}
```

EF is class ko dekh kar `CREATE TABLE Employees (Id nvarchar PK, Name nvarchar, Salary int, ...)`
banata hai (migration ke through).

---

## 13. Poori File Reference Table

### Frontend

| File | Kaam |
|---|---|
| `src/main.ts` | `bootstrapApplication(App, appConfig)` — app shuru |
| `src/app/app.config.ts` | DI providers: router, HttpClient, app-initializer (bootstrap data) |
| `src/app/app.routes.ts` | Saare routes, lazy `loadComponent`, guards, `data` |
| `src/app/app.routes.server.ts` | SSR render mode (`Client` — SSR practically off) |
| `core/models/*.ts` | TypeScript interfaces — data ki shape, koi logic nahi |
| `core/data/nav-catalogue.ts` | Sidebar menu ki static list (role + feature ke saath) |
| `core/services/auth.service.ts` | Login (API), current user signal, role checks, sessionStorage persist |
| `core/services/data-store.service.ts` | **Central state** — API se load, mutations, signals |
| `core/services/tenant-context.service.ts` | Active tenant, feature toggle (API), branding CSS var |
| `core/services/navigation.service.ts` | `visibleItems` computed = catalogue filtered by role + tenant features |
| `core/guards/auth.guard.ts` | Login check → `/login` |
| `core/guards/role.guard.ts` | Role check → `/app/forbidden` |
| `core/guards/feature.guard.ts` | Tenant feature check → `/app/forbidden` |
| `core/utils/format.ts` | `money()`, `prettyDate()` |
| `core/utils/csv.ts` | CSV string banao + `Blob` + `<a download>` se browser download |
| `core/utils/paginate.ts` | `paginate(array, page, size)` + `clampPage()` |
| `shared/directives/has-role.directive.ts` | `*appHasRole` — role-based show/hide |
| `shared/ui/button/` | `<ui-button variant loading fullWidth>` + `(pressed)` |
| `shared/ui/card/` | `<ui-card heading subheading padded>` container |
| `shared/ui/badge/` | `<ui-badge tone>` chhota status pill |
| `shared/ui/stat-card/` | `<ui-stat-card clickable>` dashboard ke gradient tiles |
| `shared/ui/sidebar/` | Nav list + tenant selector (presentational) |
| `shared/ui/modal/` | `<ui-modal title (closed)>` dialog + backdrop + Esc |
| `shared/ui/paginator/` | `<ui-paginator total pageSize [(page)]>` |
| `layout/shell/` | Sidebar + header (user chip, sign-out) + `<router-outlet>` |
| `features/auth/login/` | Email+password form, show/hide password, error handling |
| `features/dashboard/` | Role-aware stat cards (clickable → detail modal), quick links |
| `features/users/` | Employees table: pagination, CSV, edit/add/delete modals, RBAC |
| `features/departments/` | Dept cards: headcount, payroll, salary breakdown, add/edit |
| `features/team/` | Manager: direct reports roster + leave approvals |
| `features/projects/` | Project cards: status, progress bar, members, CRUD |
| `features/meetings/` | Schedule/reschedule/cancel/complete; "others" table paginated |
| `features/employee/` | Portal: attendance / leave / payslips tabs (route `data.tab`) |
| `features/reports/` | Growth + headcount tables, 3 CSV exports |
| `features/settings/` | Tenant feature toggles (switches) → dynamic menu |
| `features/profile/` | Photo upload (FileReader), profile edit form |
| `features/forbidden/` | 403 page |
| `src/styles.css` | Global: tokens, palette, base, form controls, tables, `@keyframes` |
| `proxy.conf.json` | `/api` → `localhost:5103` |
| `angular.json` | CLI: build options, `proxyConfig`, budgets |

### Backend

| File | Kaam |
|---|---|
| `server/Program.cs` | Startup: `AddControllers`, `AddDbContext(UseSqlServer)`, CORS, `Migrate()` |
| `server/appsettings.json` | Connection string |
| `server/Models/Entities.cs` | 9 entity classes = 9 DB tables |
| `server/Data/AppDbContext.cs` | `DbSet`s, `OnModelCreating` |
| `server/Data/Seed.cs` | `HasData()` demo rows (mock-data.ts se copy) |
| `server/Dtos/Dtos.cs` | Read DTOs, write request records, `ToDto()` mappers, `Csv()` helper |
| `server/Controllers/AuthController.cs` | `POST /api/auth/login` |
| `server/Controllers/BootstrapController.cs` | `GET /api/bootstrap` — sab kuch ek shot |
| `server/Controllers/EmployeesController.cs` | GET / POST / PUT / DELETE `/api/employees` |
| `server/Controllers/DepartmentsController.cs` | GET / POST / PUT |
| `server/Controllers/MeetingsController.cs` | GET / POST / PUT / `POST {id}/cancel` |
| `server/Controllers/ProjectsController.cs` | GET / POST / PUT / DELETE |
| `server/Controllers/LeaveController.cs` | GET / POST / `PUT {id}/status` |
| `server/Controllers/UsersController.cs` | `PUT {id}/profile`, `PUT {id}/avatar` |
| `server/Controllers/TenantsController.cs` | GET / `PUT {id}/features` |
| `server/Migrations/*_Init.cs` | Auto-generated schema + seed SQL (as C#) |
| `server/Migrations/AppDbContextModelSnapshot.cs` | EF ka current model ka snapshot (next migration diff ke liye) |

---

## 14. Commands Cheat Sheet

```bash
# Development (dono ek saath)
npm run dev

# Alag alag
npm run api        # C# API  → :5103
npm start          # Angular → :4200

# Build / test
npm run build      # Angular production build
npm test           # Angular unit tests (Vitest)
dotnet build server

# Database
npm run db:update                              # migrations apply (DB banao/update)
dotnet ef migrations add <Name> --project server   # entity change ke baad nayi migration
dotnet ef database drop --project server        # DB delete (phir db:update se fresh)

# DB dekhna (CLI)
sqlcmd -S "localhost\SQLEXPRESS" -d AcmeAdmin -E -Q "SELECT * FROM Employees"

# Git
git add -A && git commit -m "message" && git push

# Port stuck ho jaye
# PowerShell:
Get-NetTCPConnection -LocalPort 4200,5103 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

---

## 15. Common Sawal

**Q: `ng serve` aur `npm run dev` me farq?**
`ng serve` sirf Angular. `npm run dev` = `concurrently` se Angular + C# API dono.

**Q: Browser SQL Server se connect nahi hota?**
Nahi. Browser sirf HTTP jaanta. API (C#) SQL Server se connect hoti, browser
API se JSON leta.

**Q: Data kahan "asli" me save hota?**
`C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\DATA\AcmeAdmin.mdf`
— disk pe. App band karo, PC restart karo, data wahin rahega.

**Q: `npm install` ke baad app kyun nahi chali?**
Pehle SQL Server chahiye (`MSSQL$SQLEXPRESS` service running), phir
`npm run db:update` se DB banao, phir `npm run dev`.

**Q: Sirf frontend GitHub se clone karke chale?**
Nahi — `server/` bhi clone hota hai. Bas `.NET 10 SDK` + `SQL Server Express`
chahiye, phir `dotnet tool install --global dotnet-ef`, `npm run db:update`,
`npm install`, `npm run dev`.

**Q: Naya field add karna hai (e.g. Employee me `startDate`)?**
1. `server/Models/Entities.cs` → `Employee` me `public string StartDate {...}`
2. `dotnet ef migrations add AddStartDate --project server`
3. `npm run db:update`
4. `server/Dtos/Dtos.cs` → `EmployeeDto` + mapper me add
5. `server/Controllers/EmployeesController.cs` → Create/Update me set karo
6. `src/app/core/models/hr.model.ts` → `Employee` interface me add
7. `src/app/features/users/users.html` → form field + table column
```
