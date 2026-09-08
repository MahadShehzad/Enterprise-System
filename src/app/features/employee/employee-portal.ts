import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DataStoreService } from '../../core/services/data-store.service';
import { LeaveType } from '../../core/models/hr.model';
import { money, prettyDate } from '../../core/utils/format';
import { exportCsv } from '../../core/utils/csv';
import { paginate } from '../../core/utils/paginate';
import { CardComponent } from '../../shared/ui/card/card';
import { ButtonComponent } from '../../shared/ui/button/button';
import { BadgeComponent } from '../../shared/ui/badge/badge';
import { ModalComponent } from '../../shared/ui/modal/modal';
import { PaginatorComponent } from '../../shared/ui/paginator/paginator';

type Tab = 'attendance' | 'leave' | 'pay';

@Component({
  selector: 'app-employee-portal',
  imports: [
    FormsModule,
    RouterLink,
    RouterLinkActive,
    CardComponent,
    ButtonComponent,
    BadgeComponent,
    ModalComponent,
    PaginatorComponent,
  ],
  templateUrl: './employee-portal.html',
  styleUrl: './employee-portal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeePortalComponent {
  private readonly auth = inject(AuthService);
  protected readonly store = inject(DataStoreService);
  protected readonly money = money;
  protected readonly prettyDate = prettyDate;

  /** Bound from route data via withComponentInputBinding(). */
  readonly tab = input<Tab>('attendance');

  private readonly empId = computed(() => this.auth.user()?.employeeId ?? '');

  protected readonly me = computed(() => this.store.employeeById(this.empId()));

  protected readonly attendance = computed(() =>
    this.store.attendance().filter((a) => a.employeeId === this.empId()),
  );

  protected readonly attendanceSummary = computed(() => {
    const rows = this.attendance();
    const present = rows.filter((r) => r.status === 'Present').length;
    const remote = rows.filter((r) => r.status === 'Remote').length;
    const leave = rows.filter((r) => r.status === 'Leave').length;
    const hours = rows.reduce((s, r) => s + r.hours, 0);
    return { present, remote, leave, hours: Math.round(hours * 10) / 10, total: rows.length };
  });

  protected readonly attSize = 8;
  protected readonly attPage = signal(1);
  protected readonly attPageItems = computed(() =>
    paginate(this.attendance(), this.attPage(), this.attSize),
  );

  exportAttendance(): void {
    exportCsv(`attendance-${this.me()?.name ?? 'me'}`, this.attendance(), [
      { header: 'Date', value: (r) => r.date },
      { header: 'Clock in', value: (r) => r.clockIn },
      { header: 'Clock out', value: (r) => r.clockOut },
      { header: 'Hours', value: (r) => r.hours },
      { header: 'Status', value: (r) => r.status },
    ]);
  }

  exportPayslips(): void {
    exportCsv(`payslips-${this.me()?.name ?? 'me'}`, this.payslips(), [
      { header: 'Period', value: (p) => p.period },
      { header: 'Gross (PKR)', value: (p) => p.gross },
      { header: 'Tax (PKR)', value: (p) => p.tax },
      { header: 'Deductions (PKR)', value: (p) => p.deductions },
      { header: 'Net (PKR)', value: (p) => p.net },
      { header: 'Paid on', value: (p) => p.paidOn },
    ]);
  }

  protected readonly leave = computed(() =>
    this.store.leave().filter((l) => l.employeeId === this.empId()),
  );

  protected readonly leaveBalance = computed(() => {
    const used = this.leave()
      .filter((l) => l.status === 'Approved' && l.type === 'Annual')
      .reduce((s, l) => s + l.days, 0);
    return { total: 20, used, left: 20 - used };
  });

  protected readonly payslips = computed(() =>
    this.store.payslips().filter((p) => p.employeeId === this.empId()),
  );

  protected readonly ytd = computed(() =>
    this.payslips().reduce((s, p) => s + p.net, 0),
  );

  protected readonly leaveTypes: LeaveType[] = ['Annual', 'Sick', 'Casual', 'Unpaid'];
  protected readonly requesting = signal(false);
  protected readonly openPayslipId = signal<string | null>(null);
  protected readonly toast = signal('');

  protected form = this.blankForm();

  protected readonly openPayslip = computed(() =>
    this.payslips().find((p) => p.id === this.openPayslipId()) ?? null,
  );

  private blankForm() {
    const today = new Date().toISOString().slice(0, 10);
    return { type: 'Annual' as LeaveType, from: today, to: today, reason: '' };
  }

  openRequest(): void {
    this.form = this.blankForm();
    this.requesting.set(true);
  }

  tone(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
    if (status === 'Approved' || status === 'Present') return 'success';
    if (status === 'Pending' || status === 'Remote') return 'warning';
    if (status === 'Rejected' || status === 'Absent') return 'danger';
    return 'neutral';
  }

  submitLeave(): void {
    const f = this.form;
    if (!f.from || !f.to) {
      return;
    }
    const days = Math.max(
      1,
      Math.round(
        (new Date(f.to).getTime() - new Date(f.from).getTime()) / 86_400_000,
      ) + 1,
    );
    this.store.addLeaveRequest({
      employeeId: this.empId(),
      type: f.type,
      from: f.from,
      to: f.to,
      days,
      reason: f.reason || '—',
    });
    this.requesting.set(false);
    this.form = this.blankForm();
    this.toast.set('Leave request submitted for approval.');
    setTimeout(() => this.toast.set(''), 2800);
  }
}
