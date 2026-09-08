import { Injectable, effect, signal } from '@angular/core';
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
import {
  ATTENDANCE,
  DEPARTMENTS,
  EMPLOYEES,
  LEAVE_REQUESTS,
  MEETINGS,
  PAYSLIPS,
  PROJECTS,
} from '../data/mock-data';

const STORAGE_KEY = 'acme-admin:data-store:v1';

interface Persisted {
  employees: Employee[];
  departments: Department[];
  meetings: Meeting[];
  projects: Project[];
  leave: LeaveRequest[];
}

/**
 * Central in-memory data store. All feature pages read and mutate through here
 * so that edits, deletes and additions are reflected everywhere immediately.
 * State is persisted to sessionStorage so it survives a page refresh (but not a
 * new tab / browser – it's a mock).
 */
@Injectable({ providedIn: 'root' })
export class DataStoreService {
  private readonly restored = this.restore();

  readonly employees = signal<Employee[]>(
    this.restored?.employees ?? clone(EMPLOYEES),
  );
  readonly departments = signal<Department[]>(
    this.restored?.departments ?? clone(DEPARTMENTS),
  );
  readonly meetings = signal<Meeting[]>(
    this.restored?.meetings ?? clone(MEETINGS),
  );
  readonly projects = signal<Project[]>(
    this.restored?.projects ?? clone(PROJECTS),
  );
  readonly leave = signal<LeaveRequest[]>(
    this.restored?.leave ?? clone(LEAVE_REQUESTS),
  );

  /** Attendance & payslips are read-only in this demo. */
  readonly attendance = signal<AttendanceRecord[]>(clone(ATTENDANCE));
  readonly payslips = signal<Payslip[]>(clone(PAYSLIPS));

  private nextId = signal(1);

  constructor() {
    effect(() => this.persist());
  }

  /* ---- lookups ---------------------------------------------------------- */

  employeeById(id: string | null): Employee | undefined {
    return id ? this.employees().find((e) => e.id === id) : undefined;
  }

  departmentName(id: string): string {
    return this.departments().find((d) => d.id === id)?.name ?? '—';
  }

  /** Direct reports of a manager (reads the employees signal). */
  reportsOf(managerId: string): Employee[] {
    return this.employees().filter((e) => e.managerId === managerId);
  }

  /* ---- employees ------------------------------------------------------- */

  addEmployee(input: Omit<Employee, 'id'>): void {
    this.employees.update((list) => [
      { ...input, id: this.mint('e') },
      ...list,
    ]);
  }

  updateEmployee(id: string, patch: Partial<Employee>): void {
    this.employees.update((list) =>
      list.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    );
  }

  deleteEmployee(id: string): void {
    this.employees.update((list) => list.filter((e) => e.id !== id));
    // detach anyone who reported to the removed person
    this.employees.update((list) =>
      list.map((e) => (e.managerId === id ? { ...e, managerId: null } : e)),
    );
  }

  /* ---- meetings ------------------------------------------------------- */

  addMeeting(input: Omit<Meeting, 'id' | 'status'>): void {
    this.meetings.update((list) => [
      { ...input, id: this.mint('m'), status: 'Scheduled' },
      ...list,
    ]);
  }

  updateMeeting(id: string, patch: Partial<Meeting>): void {
    this.meetings.update((list) =>
      list.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    );
  }

  cancelMeeting(id: string): void {
    this.updateMeeting(id, { status: 'Cancelled' });
  }

  /* ---- projects ----------------------------------------------------- */

  addProject(input: Omit<Project, 'id'>): void {
    this.projects.update((list) => [
      { ...input, id: this.mint('p') },
      ...list,
    ]);
  }

  updateProject(id: string, patch: Partial<Project>): void {
    this.projects.update((list) =>
      list.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    );
  }

  deleteProject(id: string): void {
    this.projects.update((list) => list.filter((p) => p.id !== id));
  }

  /* ---- leave ------------------------------------------------------- */

  addLeaveRequest(input: Omit<LeaveRequest, 'id' | 'status'>): void {
    this.leave.update((list) => [
      { ...input, id: this.mint('l'), status: 'Pending' },
      ...list,
    ]);
  }

  setLeaveStatus(id: string, status: LeaveStatus): void {
    this.leave.update((list) =>
      list.map((l) => (l.id === id ? { ...l, status } : l)),
    );
  }

  resetToSeed(): void {
    this.employees.set(clone(EMPLOYEES));
    this.departments.set(clone(DEPARTMENTS));
    this.meetings.set(clone(MEETINGS));
    this.projects.set(clone(PROJECTS));
    this.leave.set(clone(LEAVE_REQUESTS));
  }

  /* ---- internals -------------------------------------------------- */

  private mint(prefix: string): string {
    const n = this.nextId();
    this.nextId.set(n + 1);
    return `${prefix}-new-${Date.now().toString(36)}-${n}`;
  }

  private persist(): void {
    const data: Persisted = {
      employees: this.employees(),
      departments: this.departments(),
      meetings: this.meetings(),
      projects: this.projects(),
      leave: this.leave(),
    };
    try {
      globalThis.sessionStorage?.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* storage unavailable */
    }
  }

  private restore(): Persisted | null {
    try {
      const raw = globalThis.sessionStorage?.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Persisted) : null;
    } catch {
      return null;
    }
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
