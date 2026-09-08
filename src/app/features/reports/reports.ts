import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { TenantContextService } from '../../core/services/tenant-context.service';
import { DataStoreService } from '../../core/services/data-store.service';
import { money } from '../../core/utils/format';
import { exportCsv } from '../../core/utils/csv';
import { CardComponent } from '../../shared/ui/card/card';
import { ButtonComponent } from '../../shared/ui/button/button';
import { BadgeComponent } from '../../shared/ui/badge/badge';

interface MonthRow {
  period: string;
  signups: number;
  revenue: number;
  churn: string;
}

interface DeptRow {
  department: string;
  headcount: number;
  payroll: number;
  avgSalary: number;
}

@Component({
  selector: 'app-reports',
  imports: [CardComponent, ButtonComponent, BadgeComponent],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsComponent {
  private readonly tenantCtx = inject(TenantContextService);
  private readonly store = inject(DataStoreService);
  protected readonly money = money;

  protected readonly tenantName = computed(
    () => this.tenantCtx.activeTenant()?.name ?? '',
  );

  protected readonly months: MonthRow[] = [
    { period: 'Jun 2026', signups: 210, revenue: 78100, churn: '1.8%' },
    { period: 'Jul 2026', signups: 244, revenue: 85600, churn: '1.5%' },
    { period: 'Aug 2026', signups: 267, revenue: 92400, churn: '1.3%' },
    { period: 'Sep 2026', signups: 291, revenue: 98800, churn: '1.2%' },
  ];

  private readonly tenantEmployees = computed(() =>
    this.store.employees().filter(
      (e) => e.tenantId === this.tenantCtx.activeTenant()?.id,
    ),
  );

  protected readonly deptRows = computed<DeptRow[]>(() =>
    this.store
      .departments()
      .filter((d) => d.tenantId === this.tenantCtx.activeTenant()?.id)
      .map((d) => {
        const people = this.tenantEmployees().filter(
          (e) => e.departmentId === d.id,
        );
        const payroll = people.reduce((s, e) => s + e.salary, 0);
        return {
          department: d.name,
          headcount: people.length,
          payroll,
          avgSalary: people.length ? Math.round(payroll / people.length) : 0,
        };
      }),
  );

  protected readonly totals = computed(() => {
    const rows = this.deptRows();
    return {
      headcount: rows.reduce((s, r) => s + r.headcount, 0),
      payroll: rows.reduce((s, r) => s + r.payroll, 0),
    };
  });

  exportMonthly(): void {
    exportCsv(`acme-growth-${this.slug()}`, this.months, [
      { header: 'Period', value: (r) => r.period },
      { header: 'Sign-ups', value: (r) => r.signups },
      { header: 'Revenue (USD)', value: (r) => r.revenue },
      { header: 'Churn', value: (r) => r.churn },
    ]);
  }

  exportHeadcount(): void {
    exportCsv(`acme-headcount-${this.slug()}`, this.deptRows(), [
      { header: 'Department', value: (r) => r.department },
      { header: 'Headcount', value: (r) => r.headcount },
      { header: 'Annual payroll (PKR)', value: (r) => r.payroll },
      { header: 'Average salary (PKR)', value: (r) => r.avgSalary },
    ]);
  }

  exportEmployees(): void {
    exportCsv(`acme-employees-${this.slug()}`, this.tenantEmployees(), [
      { header: 'Name', value: (e) => e.name },
      { header: 'Email', value: (e) => e.email },
      { header: 'Role', value: (e) => e.role },
      { header: 'Position', value: (e) => e.position },
      { header: 'Department', value: (e) => this.store.departmentName(e.departmentId) },
      { header: 'Status', value: (e) => e.status },
      { header: 'Salary (PKR)', value: (e) => e.salary },
      { header: 'Location', value: (e) => e.location },
      { header: 'Joined', value: (e) => e.joinedAt },
    ]);
  }

  private slug(): string {
    return (this.tenantName() || 'tenant').toLowerCase().replace(/\s+/g, '-');
  }
}
