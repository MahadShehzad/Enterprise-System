import { Role } from './role.model';

export type EmployeeStatus = 'Active' | 'Invited' | 'Suspended';

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: EmployeeStatus;
  position: string;
  departmentId: string;
  managerId: string | null;
  salary: number;
  phone: string;
  location: string;
  joinedAt: string;
  tenantId: string;
}

export interface Department {
  id: string;
  name: string;
  lead: string;
  tenantId: string;
}

export type MeetingStatus = 'Scheduled' | 'Cancelled' | 'Completed';

export interface Meeting {
  id: string;
  title: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  durationMins: number;
  attendees: string;
  ownerId: string;
  status: MeetingStatus;
}

export type ProjectStatus = 'Planning' | 'In progress' | 'On hold' | 'Done';

export interface Project {
  id: string;
  name: string;
  client: string;
  status: ProjectStatus;
  progress: number; // 0..100
  leadId: string;
  memberIds: string[];
  dueDate: string;
}

export type LeaveType = 'Annual' | 'Sick' | 'Casual' | 'Unpaid';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: LeaveType;
  from: string;
  to: string;
  days: number;
  reason: string;
  status: LeaveStatus;
}

export type AttendanceStatus = 'Present' | 'Remote' | 'Leave' | 'Absent';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  clockIn: string;
  clockOut: string;
  status: AttendanceStatus;
  hours: number;
}

export interface Payslip {
  id: string;
  employeeId: string;
  period: string; // e.g. "August 2026"
  gross: number;
  tax: number;
  deductions: number;
  net: number;
  paidOn: string;
}
