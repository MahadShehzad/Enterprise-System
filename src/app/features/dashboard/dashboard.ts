import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TenantContextService } from '../../core/services/tenant-context.service';
import { AuthService } from '../../core/services/auth.service';
import { DataStoreService } from '../../core/services/data-store.service';
import { money } from '../../core/utils/format';
import { StatAccent, StatCardComponent } from '../../shared/ui/stat-card/stat-card';
import { CardComponent } from '../../shared/ui/card/card';
import { ModalComponent } from '../../shared/ui/modal/modal';
import { HasRoleDirective } from '../../shared/directives/has-role.directive';

interface DetailRow {
  label: string;
  value: string;
}

interface StatDef {
  key: string;
  label: string;
  value: string;
  icon: string;
  delta: string;
  trend: 'up' | 'down' | 'flat';
  accent: StatAccent;
  detailTitle: string;
  rows: DetailRow[];
}

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    StatCardComponent,
    CardComponent,
    ModalComponent,
    HasRoleDirective,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private readonly tenantCtx = inject(TenantContextService);
  private readonly auth = inject(AuthService);
  private readonly store = inject(DataStoreService);

  protected readonly tenant = this.tenantCtx.activeTenant;
  protected readonly user = this.auth.user;

  private readonly tenantEmployees = computed(() =>
    this.store.employees().filter((e) => e.tenantId === this.tenant()?.id),
  );

  protected readonly stats = computed<StatDef[]>(() => {
    const emps = this.tenantEmployees();
    const role = this.user()?.role;
    const payroll = emps.reduce((sum, e) => sum + e.salary, 0);
    const depts = this.store
      .departments()
      .filter((d) => d.tenantId === this.tenant()?.id);
    const meetings = this.store
      .meetings()
      .filter((m) => m.status === 'Scheduled');
    const projects = this.store.projects();
    const myLeave = this.store
      .leave()
      .filter((l) => l.employeeId === this.user()?.employeeId);

    if (role === 'Employee') {
      const att = this.store
        .attendance()
        .filter((a) => a.employeeId === this.user()?.employeeId);
      const present = att.filter((a) => a.status === 'Present').length;
      const pay = this.store
        .payslips()
        .filter((p) => p.employeeId === this.user()?.employeeId);
      return [
        {
          key: 'attendance', label: 'Attendance this month', value: `${present}/${att.length}`,
          icon: '◔', delta: 'days present', trend: 'up', accent: 'brand',
          detailTitle: 'Recent attendance',
          rows: att.map((a) => ({ label: a.date, value: `${a.status} · ${a.hours}h` })),
        },
        {
          key: 'leave', label: 'Leave requests', value: String(myLeave.length),
          icon: '◵', delta: `${myLeave.filter((l) => l.status === 'Pending').length} pending`,
          trend: 'flat', accent: 'mint', detailTitle: 'Your leave requests',
          rows: myLeave.map((l) => ({ label: `${l.type} · ${l.from}`, value: l.status })),
        },
        {
          key: 'pay', label: 'Last payslip', value: pay.length ? money(pay[pay.length - 1].net) : '—',
          icon: '▦', delta: pay.length ? pay[pay.length - 1].period : '', trend: 'up', accent: 'peach',
          detailTitle: 'Payslip history',
          rows: pay.map((p) => ({ label: p.period, value: money(p.net) })),
        },
        {
          key: 'projects', label: 'Projects assigned', value: String(
            projects.filter((p) => p.memberIds.includes(this.user()?.employeeId ?? '')).length,
          ),
          icon: '▧', delta: 'you are a member of', trend: 'flat', accent: 'pink',
          detailTitle: 'Your projects',
          rows: projects
            .filter((p) => p.memberIds.includes(this.user()?.employeeId ?? ''))
            .map((p) => ({ label: p.name, value: `${p.status} · ${p.progress}%` })),
        },
      ];
    }

    // Admin / Manager / Viewer
    return [
      {
        key: 'headcount', label: 'Headcount', value: String(emps.length),
        icon: '◔', delta: `${emps.filter((e) => e.status === 'Active').length} active`,
        trend: 'up', accent: 'brand', detailTitle: 'Employees by department',
        rows: depts.map((d) => ({
          label: d.name,
          value: `${emps.filter((e) => e.departmentId === d.id).length} people`,
        })),
      },
      {
        key: 'payroll', label: 'Annual payroll', value: money(payroll),
        icon: '▦', delta: `${depts.length} departments`, trend: 'flat', accent: 'mint',
        detailTitle: 'Payroll by department',
        rows: depts.map((d) => ({
          label: d.name,
          value: money(
            emps.filter((e) => e.departmentId === d.id).reduce((s, e) => s + e.salary, 0),
          ),
        })),
      },
      {
        key: 'projects', label: 'Active projects', value: String(
          projects.filter((p) => p.status === 'In progress').length,
        ),
        icon: '▧', delta: `${projects.length} total`, trend: 'up', accent: 'peach',
        detailTitle: 'Project portfolio',
        rows: projects.map((p) => ({ label: p.name, value: `${p.status} · ${p.progress}%` })),
      },
      {
        key: 'meetings', label: 'Meetings scheduled', value: String(meetings.length),
        icon: '◷', delta: 'upcoming', trend: 'flat', accent: 'pink',
        detailTitle: 'Upcoming meetings',
        rows: meetings.map((m) => ({ label: `${m.date} ${m.time}`, value: m.title })),
      },
    ];
  });

  protected readonly openStat = signal<StatDef | null>(null);

  protected readonly activity = computed(() => {
    const emps = this.tenantEmployees();
    return [
      { who: emps[2]?.name ?? 'A teammate', what: 'was added to the directory', when: '2h ago' },
      { who: emps[1]?.name ?? 'A manager', what: 'updated a project status', when: '5h ago' },
      { who: 'System', what: 'nightly payroll sync completed', when: '9h ago' },
    ];
  });

  show(stat: StatDef): void {
    this.openStat.set(stat);
  }
}
