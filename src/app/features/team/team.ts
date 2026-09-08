import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { DataStoreService } from '../../core/services/data-store.service';
import { Employee } from '../../core/models/hr.model';
import { money } from '../../core/utils/format';
import { exportCsv } from '../../core/utils/csv';
import { paginate } from '../../core/utils/paginate';
import { CardComponent } from '../../shared/ui/card/card';
import { ButtonComponent } from '../../shared/ui/button/button';
import { BadgeComponent } from '../../shared/ui/badge/badge';
import { ModalComponent } from '../../shared/ui/modal/modal';
import { PaginatorComponent } from '../../shared/ui/paginator/paginator';

@Component({
  selector: 'app-team',
  imports: [
    FormsModule,
    CardComponent,
    ButtonComponent,
    BadgeComponent,
    ModalComponent,
    PaginatorComponent,
  ],
  templateUrl: './team.html',
  styleUrl: './team.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamComponent {
  private readonly auth = inject(AuthService);
  protected readonly store = inject(DataStoreService);
  protected readonly money = money;

  private readonly myEmpId = computed(() => this.auth.user()?.employeeId ?? '');

  protected readonly team = computed(() => this.store.reportsOf(this.myEmpId()));

  protected readonly totalCost = computed(() =>
    this.team().reduce((s, e) => s + e.salary, 0),
  );

  protected readonly pageSize = 6;
  protected readonly page = signal(1);
  protected readonly pageItems = computed(() =>
    paginate(this.team(), this.page(), this.pageSize),
  );

  protected readonly leavePageSize = 6;
  protected readonly leavePage = signal(1);
  protected readonly leavePageItems = computed(() =>
    paginate(this.pendingLeave(), this.leavePage(), this.leavePageSize),
  );

  exportRoster(): void {
    exportCsv('my-team-roster', this.team(), [
      { header: 'Name', value: (e) => e.name },
      { header: 'Email', value: (e) => e.email },
      { header: 'Position', value: (e) => e.position },
      { header: 'Department', value: (e) => this.deptName(e.departmentId) },
      { header: 'Status', value: (e) => e.status },
      { header: 'Salary (PKR)', value: (e) => e.salary },
    ]);
  }

  protected readonly pendingLeave = computed(() => {
    const ids = new Set(this.team().map((e) => e.id));
    return this.store.leave().filter((l) => l.status === 'Pending' && ids.has(l.employeeId));
  });

  protected readonly editing = signal<
    { id: string; position: string; salary: number; status: Employee['status'] } | null
  >(null);
  protected readonly toast = signal('');

  empName(id: string): string {
    return this.store.employeeById(id)?.name ?? id;
  }

  deptName(id: string): string {
    return this.store.departmentName(id);
  }

  startEdit(e: Employee): void {
    this.editing.set({
      id: e.id,
      position: e.position,
      salary: e.salary,
      status: e.status,
    });
  }

  save(): void {
    const f = this.editing();
    if (!f) {
      return;
    }
    this.store.updateEmployee(f.id, {
      position: f.position,
      salary: Number(f.salary) || 0,
      status: f.status,
    });
    this.editing.set(null);
    this.flash('Team member updated.');
  }

  decideLeave(id: string, approve: boolean): void {
    this.store.setLeaveStatus(id, approve ? 'Approved' : 'Rejected');
    this.flash(approve ? 'Leave approved.' : 'Leave rejected.');
  }

  private flash(msg: string): void {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(''), 2800);
  }
}
