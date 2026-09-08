import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  AttendanceRecord,
  Department,
  Employee,
  LeaveRequest,
  LeaveStatus,
  Meeting,
  Payslip,
  Project,
} from '../models/hr.model';
import { Tenant } from '../models/tenant.model';

interface BootstrapResponse {
  tenants: Tenant[];
  departments: Department[];
  employees: Employee[];
  meetings: Meeting[];
  projects: Project[];
  leave: LeaveRequest[];
  attendance: AttendanceRecord[];
  payslips: Payslip[];
}

/**
 * Loads all application data from the ASP.NET Core API (SQL Server backed) and
 * keeps it in signals. Every mutation calls the matching endpoint and then
 * patches the local signal with the server's response, so the UI stays in sync
 * with the database.
 */
@Injectable({ providedIn: 'root' })
export class DataStoreService {
  private readonly http = inject(HttpClient);

  readonly tenants = signal<Tenant[]>([]);
  readonly departments = signal<Department[]>([]);
  readonly employees = signal<Employee[]>([]);
  readonly meetings = signal<Meeting[]>([]);
  readonly projects = signal<Project[]>([]);
  readonly leave = signal<LeaveRequest[]>([]);
  readonly attendance = signal<AttendanceRecord[]>([]);
  readonly payslips = signal<Payslip[]>([]);

  readonly loaded = signal(false);
  readonly error = signal('');

  private bootstrapPromise: Promise<void> | null = null;

  /** Called once from an app initializer; safe to await repeatedly. */
  bootstrap(): Promise<void> {
    if (!this.bootstrapPromise) {
      this.bootstrapPromise = this.load();
    }
    return this.bootstrapPromise;
  }

  async reload(): Promise<void> {
    this.bootstrapPromise = this.load();
    return this.bootstrapPromise;
  }

  private async load(): Promise<void> {
    try {
      const data = await firstValueFrom(
        this.http.get<BootstrapResponse>('/api/bootstrap'),
      );
      this.tenants.set(data.tenants);
      this.departments.set(data.departments);
      this.employees.set(data.employees);
      this.meetings.set(data.meetings);
      this.projects.set(data.projects);
      this.leave.set(data.leave);
      this.attendance.set(data.attendance);
      this.payslips.set(data.payslips);
      this.error.set('');
    } catch {
      this.error.set('Could not reach the API. Is the server running on :5103?');
    } finally {
      this.loaded.set(true);
    }
  }

  /* ---- lookups ---------------------------------------------------------- */

  employeeById(id: string | null): Employee | undefined {
    return id ? this.employees().find((e) => e.id === id) : undefined;
  }

  departmentName(id: string): string {
    return this.departments().find((d) => d.id === id)?.name ?? '—';
  }

  reportsOf(managerId: string): Employee[] {
    return this.employees().filter((e) => e.managerId === managerId);
  }

  /* ---- employees ------------------------------------------------------- */

  async addEmployee(input: Omit<Employee, 'id'>): Promise<void> {
    const created = await firstValueFrom(
      this.http.post<Employee>('/api/employees', input),
    );
    this.employees.update((list) => [created, ...list]);
  }

  async updateEmployee(id: string, patch: Partial<Employee>): Promise<void> {
    const current = this.employeeById(id);
    if (!current) return;
    const updated = await firstValueFrom(
      this.http.put<Employee>(`/api/employees/${id}`, { ...current, ...patch }),
    );
    this.employees.update((list) =>
      list.map((e) => (e.id === id ? updated : e)),
    );
  }

  async deleteEmployee(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`/api/employees/${id}`));
    this.employees.update((list) =>
      list
        .filter((e) => e.id !== id)
        .map((e) => (e.managerId === id ? { ...e, managerId: null } : e)),
    );
  }

  /* ---- departments -------------------------------------------------- */

  async addDepartment(input: Omit<Department, 'id'>): Promise<void> {
    const created = await firstValueFrom(
      this.http.post<Department>('/api/departments', input),
    );
    this.departments.update((list) => [...list, created]);
  }

  async updateDepartment(id: string, patch: Partial<Department>): Promise<void> {
    const current = this.departments().find((d) => d.id === id);
    if (!current) return;
    const updated = await firstValueFrom(
      this.http.put<Department>(`/api/departments/${id}`, { ...current, ...patch }),
    );
    this.departments.update((list) =>
      list.map((d) => (d.id === id ? updated : d)),
    );
  }

  /* ---- meetings ------------------------------------------------------- */

  async addMeeting(input: Omit<Meeting, 'id' | 'status'>): Promise<void> {
    const created = await firstValueFrom(
      this.http.post<Meeting>('/api/meetings', input),
    );
    this.meetings.update((list) => [created, ...list]);
  }

  async updateMeeting(id: string, patch: Partial<Meeting>): Promise<void> {
    const current = this.meetings().find((m) => m.id === id);
    if (!current) return;
    const updated = await firstValueFrom(
      this.http.put<Meeting>(`/api/meetings/${id}`, { ...current, ...patch }),
    );
    this.meetings.update((list) => list.map((m) => (m.id === id ? updated : m)));
  }

  async cancelMeeting(id: string): Promise<void> {
    const updated = await firstValueFrom(
      this.http.post<Meeting>(`/api/meetings/${id}/cancel`, {}),
    );
    this.meetings.update((list) => list.map((m) => (m.id === id ? updated : m)));
  }

  /* ---- projects ----------------------------------------------------- */

  async addProject(input: Omit<Project, 'id'>): Promise<void> {
    const created = await firstValueFrom(
      this.http.post<Project>('/api/projects', input),
    );
    this.projects.update((list) => [created, ...list]);
  }

  async updateProject(id: string, patch: Partial<Project>): Promise<void> {
    const current = this.projects().find((p) => p.id === id);
    if (!current) return;
    const updated = await firstValueFrom(
      this.http.put<Project>(`/api/projects/${id}`, { ...current, ...patch }),
    );
    this.projects.update((list) => list.map((p) => (p.id === id ? updated : p)));
  }

  async deleteProject(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`/api/projects/${id}`));
    this.projects.update((list) => list.filter((p) => p.id !== id));
  }

  /* ---- leave ------------------------------------------------------- */

  async addLeaveRequest(input: Omit<LeaveRequest, 'id' | 'status'>): Promise<void> {
    const created = await firstValueFrom(
      this.http.post<LeaveRequest>('/api/leave', input),
    );
    this.leave.update((list) => [created, ...list]);
  }

  async setLeaveStatus(id: string, status: LeaveStatus): Promise<void> {
    const updated = await firstValueFrom(
      this.http.put<LeaveRequest>(`/api/leave/${id}/status`, { status }),
    );
    this.leave.update((list) => list.map((l) => (l.id === id ? updated : l)));
  }

  /* ---- tenants ---------------------------------------------------- */

  async setTenantFeatures(
    tenantId: string,
    enabledFeatures: string[],
  ): Promise<void> {
    const updated = await firstValueFrom(
      this.http.put<Tenant>(`/api/tenants/${tenantId}/features`, {
        enabledFeatures,
      }),
    );
    this.tenants.update((list) =>
      list.map((t) => (t.id === tenantId ? updated : t)),
    );
  }
}
