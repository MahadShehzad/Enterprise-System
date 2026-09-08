import { NavItem } from '../models/nav-item.model';
import { Tenant } from '../models/tenant.model';
import { User } from '../models/user.model';
import {
  AttendanceRecord,
  Department,
  Employee,
  LeaveRequest,
  Meeting,
  Payslip,
  Project,
} from '../models/hr.model';

/* -------------------------------------------------------------------------- */
/*  Tenants                                                                    */
/* -------------------------------------------------------------------------- */

export const TENANTS: Tenant[] = [
  {
    id: 'orient',
    name: 'Orient Textiles',
    branding: { primary: '#a9805b', shortName: 'OT' },
    enabledFeatures: ['dashboard', 'users', 'reports', 'settings'],
  },
  {
    id: 'packages',
    name: 'Packages Group',
    branding: { primary: '#8f6844', shortName: 'PG' },
    enabledFeatures: ['dashboard', 'users', 'settings'],
  },
  {
    id: 'systems',
    name: 'Systems Limited',
    branding: { primary: '#7c5234', shortName: 'SL' },
    enabledFeatures: ['dashboard', 'reports'],
  },
];

/* -------------------------------------------------------------------------- */
/*  Login accounts (mock credentials)                                          */
/* -------------------------------------------------------------------------- */

export const USERS: User[] = [
  {
    id: 'u-admin',
    name: 'Ayesha Khan',
    email: 'ayesha.khan@acme.pk',
    password: 'admin123',
    role: 'Admin',
    tenantIds: ['orient', 'packages', 'systems'],
    employeeId: 'e1',
    profile: {
      title: 'Head of Operations',
      department: 'Operations',
      phone: '+92 300 1234567',
      location: 'Karachi, Pakistan',
      bio: 'Oversees platform administration and tenant onboarding across all regions.',
      joinedAt: 'March 2023',
      avatarUrl: '',
    },
  },
  {
    id: 'u-manager',
    name: 'Bilal Ahmed',
    email: 'bilal.ahmed@acme.pk',
    password: 'manager123',
    role: 'Manager',
    tenantIds: ['orient', 'packages'],
    employeeId: 'e2',
    profile: {
      title: 'Sales Manager',
      department: 'Sales',
      phone: '+92 321 7654321',
      location: 'Lahore, Pakistan',
      bio: 'Leads the northern sales team and owns the active project portfolio.',
      joinedAt: 'August 2023',
      avatarUrl: '',
    },
  },
  {
    id: 'u-employee',
    name: 'Imran Yousaf',
    email: 'imran.yousaf@acme.pk',
    password: 'employee123',
    role: 'Employee',
    tenantIds: ['orient'],
    employeeId: 'e4',
    profile: {
      title: 'Software Engineer',
      department: 'Engineering',
      phone: '+92 345 2223344',
      location: 'Lahore, Pakistan',
      bio: 'Builds and maintains internal tools for the operations team.',
      joinedAt: 'February 2024',
      avatarUrl: '',
    },
  },
  {
    id: 'u-viewer',
    name: 'Sana Malik',
    email: 'sana.malik@acme.pk',
    password: 'viewer123',
    role: 'Viewer',
    tenantIds: ['orient'],
    employeeId: 'e3',
    profile: {
      title: 'Business Analyst',
      department: 'Analytics',
      phone: '+92 333 9876543',
      location: 'Islamabad, Pakistan',
      bio: 'Reviews dashboards and report summaries to support planning decisions.',
      joinedAt: 'January 2024',
      avatarUrl: '',
    },
  },
];

/* -------------------------------------------------------------------------- */
/*  Navigation catalogue                                                       */
/* -------------------------------------------------------------------------- */

export const NAV_CATALOGUE: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/app/dashboard',
    icon: '▦',
    feature: 'dashboard',
    roles: ['Viewer', 'Employee', 'Manager', 'Admin'],
  },
  {
    label: 'Departments',
    path: '/app/departments',
    icon: '▤',
    feature: 'users',
    roles: ['Admin'],
  },
  {
    label: 'Employees',
    path: '/app/users',
    icon: '◔',
    feature: 'users',
    roles: ['Manager', 'Admin'],
  },
  {
    label: 'My Team',
    path: '/app/team',
    icon: '◑',
    feature: 'users',
    roles: ['Manager'],
  },
  {
    label: 'Projects',
    path: '/app/projects',
    icon: '▧',
    feature: 'dashboard',
    roles: ['Manager', 'Admin'],
  },
  {
    label: 'Meetings',
    path: '/app/meetings',
    icon: '◷',
    feature: 'dashboard',
    roles: ['Manager', 'Admin'],
  },
  {
    label: 'My Attendance',
    path: '/app/me/attendance',
    icon: '◔',
    feature: 'dashboard',
    roles: ['Employee'],
  },
  {
    label: 'My Leave',
    path: '/app/me/leave',
    icon: '◵',
    feature: 'dashboard',
    roles: ['Employee'],
  },
  {
    label: 'My Payslips',
    path: '/app/me/pay',
    icon: '▦',
    feature: 'dashboard',
    roles: ['Employee'],
  },
  {
    label: 'Reports',
    path: '/app/reports',
    icon: '▤',
    feature: 'reports',
    roles: ['Viewer', 'Manager', 'Admin'],
  },
  {
    label: 'Settings',
    path: '/app/settings',
    icon: '⚙',
    feature: 'settings',
    roles: ['Admin'],
  },
];

/* -------------------------------------------------------------------------- */
/*  HR seed data                                                               */
/* -------------------------------------------------------------------------- */

export const DEPARTMENTS: Department[] = [
  { id: 'dept-ops', name: 'Operations', lead: 'Ayesha Khan', tenantId: 'orient' },
  { id: 'dept-sales', name: 'Sales', lead: 'Bilal Ahmed', tenantId: 'orient' },
  { id: 'dept-eng', name: 'Engineering', lead: 'Hassan Raza', tenantId: 'orient' },
  { id: 'dept-analytics', name: 'Analytics', lead: 'Sana Malik', tenantId: 'orient' },
  { id: 'dept-hr', name: 'Human Resources', lead: 'Maryam Nawaz', tenantId: 'orient' },
];

export const EMPLOYEES: Employee[] = [
  {
    id: 'e1', name: 'Ayesha Khan', email: 'ayesha.khan@acme.pk', role: 'Admin',
    status: 'Active', position: 'Head of Operations', departmentId: 'dept-ops',
    managerId: null, salary: 720000, phone: '+92 300 1234567',
    location: 'Karachi', joinedAt: '2023-03-06', tenantId: 'orient',
  },
  {
    id: 'e2', name: 'Bilal Ahmed', email: 'bilal.ahmed@acme.pk', role: 'Manager',
    status: 'Active', position: 'Sales Manager', departmentId: 'dept-sales',
    managerId: 'e1', salary: 480000, phone: '+92 321 7654321',
    location: 'Lahore', joinedAt: '2023-08-14', tenantId: 'orient',
  },
  {
    id: 'e3', name: 'Sana Malik', email: 'sana.malik@acme.pk', role: 'Viewer',
    status: 'Active', position: 'Business Analyst', departmentId: 'dept-analytics',
    managerId: 'e2', salary: 260000, phone: '+92 333 9876543',
    location: 'Islamabad', joinedAt: '2024-01-09', tenantId: 'orient',
  },
  {
    id: 'e4', name: 'Imran Yousaf', email: 'imran.yousaf@acme.pk', role: 'Employee',
    status: 'Active', position: 'Software Engineer', departmentId: 'dept-eng',
    managerId: 'e2', salary: 340000, phone: '+92 345 2223344',
    location: 'Lahore', joinedAt: '2024-02-01', tenantId: 'orient',
  },
  {
    id: 'e5', name: 'Fatima Sheikh', email: 'fatima.sheikh@acme.pk', role: 'Employee',
    status: 'Invited', position: 'Sales Executive', departmentId: 'dept-sales',
    managerId: 'e2', salary: 220000, phone: '+92 300 4455667',
    location: 'Lahore', joinedAt: '2024-06-18', tenantId: 'orient',
  },
  {
    id: 'e6', name: 'Usman Raza', email: 'usman.raza@acme.pk', role: 'Employee',
    status: 'Active', position: 'Operations Analyst', departmentId: 'dept-ops',
    managerId: 'e1', salary: 300000, phone: '+92 301 5566778',
    location: 'Karachi', joinedAt: '2023-11-02', tenantId: 'orient',
  },
  {
    id: 'e7', name: 'Zainab Iqbal', email: 'zainab.iqbal@acme.pk', role: 'Employee',
    status: 'Active', position: 'Frontend Engineer', departmentId: 'dept-eng',
    managerId: 'e2', salary: 320000, phone: '+92 302 6677889',
    location: 'Remote', joinedAt: '2024-03-21', tenantId: 'orient',
  },
  {
    id: 'e8', name: 'Hamza Farooq', email: 'hamza.farooq@acme.pk', role: 'Employee',
    status: 'Suspended', position: 'Support Specialist', departmentId: 'dept-ops',
    managerId: 'e1', salary: 210000, phone: '+92 303 7788990',
    location: 'Karachi', joinedAt: '2023-09-11', tenantId: 'orient',
  },
  {
    id: 'e9', name: 'Maryam Nawaz', email: 'maryam.nawaz@acme.pk', role: 'Manager',
    status: 'Active', position: 'HR Business Partner', departmentId: 'dept-hr',
    managerId: 'e1', salary: 440000, phone: '+92 304 8899001',
    location: 'Islamabad', joinedAt: '2023-05-30', tenantId: 'orient',
  },
  {
    id: 'e10', name: 'Ali Hassan', email: 'ali.hassan@acme.pk', role: 'Employee',
    status: 'Active', position: 'Data Analyst', departmentId: 'dept-analytics',
    managerId: 'e2', salary: 280000, phone: '+92 305 9900112',
    location: 'Lahore', joinedAt: '2024-04-15', tenantId: 'orient',
  },
];

export const MEETINGS: Meeting[] = [
  {
    id: 'm1', title: 'Weekly leadership sync', date: '2026-09-10', time: '10:00',
    durationMins: 45, attendees: 'Ayesha, Bilal, Maryam', ownerId: 'u-admin',
    status: 'Scheduled',
  },
  {
    id: 'm2', title: 'Q4 hiring plan review', date: '2026-09-12', time: '14:30',
    durationMins: 60, attendees: 'Ayesha, Maryam', ownerId: 'u-admin',
    status: 'Scheduled',
  },
  {
    id: 'm3', title: 'Vendor contract call', date: '2026-09-05', time: '16:00',
    durationMins: 30, attendees: 'Ayesha, External', ownerId: 'u-admin',
    status: 'Completed',
  },
  {
    id: 'm4', title: 'Sales pipeline standup', date: '2026-09-09', time: '09:15',
    durationMins: 20, attendees: 'Bilal, Fatima, Ali', ownerId: 'u-manager',
    status: 'Scheduled',
  },
];

export const PROJECTS: Project[] = [
  {
    id: 'p1', name: 'Retail portal revamp', client: 'Orient Retail',
    status: 'In progress', progress: 62, leadId: 'e2',
    memberIds: ['e4', 'e7', 'e10'], dueDate: '2026-11-15',
  },
  {
    id: 'p2', name: 'Warehouse automation', client: 'Internal Ops',
    status: 'Planning', progress: 15, leadId: 'e2',
    memberIds: ['e6', 'e4'], dueDate: '2027-01-20',
  },
  {
    id: 'p3', name: 'Analytics data mart', client: 'Internal',
    status: 'On hold', progress: 40, leadId: 'e2',
    memberIds: ['e3', 'e10'], dueDate: '2026-12-05',
  },
];

export const LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'l1', employeeId: 'e4', type: 'Annual', from: '2026-09-22', to: '2026-09-24',
    days: 3, reason: 'Family trip', status: 'Pending',
  },
  {
    id: 'l2', employeeId: 'e4', type: 'Sick', from: '2026-08-11', to: '2026-08-11',
    days: 1, reason: 'Fever', status: 'Approved',
  },
  {
    id: 'l3', employeeId: 'e7', type: 'Casual', from: '2026-09-18', to: '2026-09-18',
    days: 1, reason: 'Personal errand', status: 'Pending',
  },
  {
    id: 'l4', employeeId: 'e10', type: 'Annual', from: '2026-10-01', to: '2026-10-03',
    days: 3, reason: 'Vacation', status: 'Pending',
  },
];

function attendanceFor(employeeId: string): AttendanceRecord[] {
  const base: Omit<AttendanceRecord, 'id' | 'employeeId'>[] = [
    { date: '2026-09-01', clockIn: '09:05', clockOut: '17:35', status: 'Present', hours: 8.5 },
    { date: '2026-09-02', clockIn: '09:00', clockOut: '17:10', status: 'Present', hours: 8.2 },
    { date: '2026-09-03', clockIn: '—', clockOut: '—', status: 'Remote', hours: 8 },
    { date: '2026-09-04', clockIn: '09:20', clockOut: '17:40', status: 'Present', hours: 8.3 },
    { date: '2026-09-05', clockIn: '—', clockOut: '—', status: 'Leave', hours: 0 },
    { date: '2026-09-08', clockIn: '08:55', clockOut: '17:25', status: 'Present', hours: 8.5 },
  ];
  return base.map((r, i) => ({ ...r, id: `${employeeId}-att-${i}`, employeeId }));
}

export const ATTENDANCE: AttendanceRecord[] = [
  ...attendanceFor('e4'),
  ...attendanceFor('e7'),
];

function payslipsFor(employeeId: string, monthlyGross: number): Payslip[] {
  const periods = ['June 2026', 'July 2026', 'August 2026'];
  const paidOn = ['2026-06-30', '2026-07-31', '2026-08-31'];
  return periods.map((period, i) => {
    const tax = Math.round(monthlyGross * 0.1);
    const deductions = 3500;
    return {
      id: `${employeeId}-pay-${i}`,
      employeeId,
      period,
      gross: monthlyGross,
      tax,
      deductions,
      net: monthlyGross - tax - deductions,
      paidOn: paidOn[i],
    };
  });
}

export const PAYSLIPS: Payslip[] = [
  ...payslipsFor('e4', 78000),
  ...payslipsFor('e7', 74000),
];
