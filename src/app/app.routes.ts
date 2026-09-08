import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { featureGuard } from './core/guards/feature.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'app/dashboard', pathMatch: 'full' },
  {
    path: 'login',
    title: 'Sign in · Acme Admin',
    loadComponent: () =>
      import('./features/auth/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/shell/shell').then((m) => m.ShellComponent),
    children: [
      {
        path: 'dashboard',
        title: 'Dashboard · Acme Admin',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then((m) => m.DashboardComponent),
      },
      {
        path: 'departments',
        title: 'Departments · Acme Admin',
        canActivate: [roleGuard, featureGuard],
        data: { allowedRoles: ['Admin'], feature: 'users' },
        loadComponent: () =>
          import('./features/departments/departments').then(
            (m) => m.DepartmentsComponent,
          ),
      },
      {
        path: 'users',
        title: 'Employees · Acme Admin',
        canActivate: [roleGuard, featureGuard],
        data: { allowedRoles: ['Manager', 'Admin'], feature: 'users' },
        loadComponent: () =>
          import('./features/users/users').then((m) => m.UsersComponent),
      },
      {
        path: 'team',
        title: 'My team · Acme Admin',
        canActivate: [roleGuard],
        data: { allowedRoles: ['Manager'] },
        loadComponent: () =>
          import('./features/team/team').then((m) => m.TeamComponent),
      },
      {
        path: 'projects',
        title: 'Projects · Acme Admin',
        canActivate: [roleGuard],
        data: { allowedRoles: ['Manager', 'Admin'] },
        loadComponent: () =>
          import('./features/projects/projects').then((m) => m.ProjectsComponent),
      },
      {
        path: 'meetings',
        title: 'Meetings · Acme Admin',
        canActivate: [roleGuard],
        data: { allowedRoles: ['Manager', 'Admin'] },
        loadComponent: () =>
          import('./features/meetings/meetings').then((m) => m.MeetingsComponent),
      },
      {
        path: 'me/attendance',
        title: 'My attendance · Acme Admin',
        canActivate: [roleGuard],
        data: { allowedRoles: ['Employee'], tab: 'attendance' },
        loadComponent: () =>
          import('./features/employee/employee-portal').then(
            (m) => m.EmployeePortalComponent,
          ),
      },
      {
        path: 'me/leave',
        title: 'My leave · Acme Admin',
        canActivate: [roleGuard],
        data: { allowedRoles: ['Employee'], tab: 'leave' },
        loadComponent: () =>
          import('./features/employee/employee-portal').then(
            (m) => m.EmployeePortalComponent,
          ),
      },
      {
        path: 'me/pay',
        title: 'My payslips · Acme Admin',
        canActivate: [roleGuard],
        data: { allowedRoles: ['Employee'], tab: 'pay' },
        loadComponent: () =>
          import('./features/employee/employee-portal').then(
            (m) => m.EmployeePortalComponent,
          ),
      },
      {
        path: 'reports',
        title: 'Reports · Acme Admin',
        canActivate: [roleGuard, featureGuard],
        data: { allowedRoles: ['Viewer', 'Manager', 'Admin'], feature: 'reports' },
        loadComponent: () =>
          import('./features/reports/reports').then((m) => m.ReportsComponent),
      },
      {
        path: 'settings',
        title: 'Settings · Acme Admin',
        canActivate: [roleGuard, featureGuard],
        data: { allowedRoles: ['Admin'], feature: 'settings' },
        loadComponent: () =>
          import('./features/settings/settings').then((m) => m.SettingsComponent),
      },
      {
        path: 'profile',
        title: 'My profile · Acme Admin',
        loadComponent: () =>
          import('./features/profile/profile').then((m) => m.ProfileComponent),
      },
      {
        path: 'forbidden',
        title: 'Not allowed · Acme Admin',
        loadComponent: () =>
          import('./features/forbidden/forbidden').then((m) => m.ForbiddenComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'app/dashboard' },
];
