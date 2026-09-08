import { NavItem } from '../models/nav-item.model';

/**
 * Static navigation config. The visible menu is derived from this at runtime by
 * `NavigationService` using the current role + the active tenant's enabled
 * features. (This is app configuration, not data — it stays client-side.)
 */
export const NAV_CATALOGUE: NavItem[] = [
  { label: 'Dashboard', path: '/app/dashboard', icon: '▦', feature: 'dashboard', roles: ['Viewer', 'Employee', 'Manager', 'Admin'] },
  { label: 'Departments', path: '/app/departments', icon: '▤', feature: 'users', roles: ['Admin'] },
  { label: 'Employees', path: '/app/users', icon: '◔', feature: 'users', roles: ['Manager', 'Admin'] },
  { label: 'My Team', path: '/app/team', icon: '◑', feature: 'users', roles: ['Manager'] },
  { label: 'Projects', path: '/app/projects', icon: '▧', feature: 'dashboard', roles: ['Manager', 'Admin'] },
  { label: 'Meetings', path: '/app/meetings', icon: '◷', feature: 'dashboard', roles: ['Manager', 'Admin'] },
  { label: 'My Attendance', path: '/app/me/attendance', icon: '◔', feature: 'dashboard', roles: ['Employee'] },
  { label: 'My Leave', path: '/app/me/leave', icon: '◵', feature: 'dashboard', roles: ['Employee'] },
  { label: 'My Payslips', path: '/app/me/pay', icon: '▦', feature: 'dashboard', roles: ['Employee'] },
  { label: 'Reports', path: '/app/reports', icon: '▤', feature: 'reports', roles: ['Viewer', 'Manager', 'Admin'] },
  { label: 'Settings', path: '/app/settings', icon: '⚙', feature: 'settings', roles: ['Admin'] },
];
