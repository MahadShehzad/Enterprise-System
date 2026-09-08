import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TenantContextService } from '../../core/services/tenant-context.service';
import { DataStoreService } from '../../core/services/data-store.service';
import { Employee, EmployeeStatus } from '../../core/models/hr.model';
import { Role, ALL_ROLES } from '../../core/models/role.model';
import { money } from '../../core/utils/format';
import { exportCsv } from '../../core/utils/csv';
import { paginate } from '../../core/utils/paginate';
import { CardComponent } from '../../shared/ui/card/card';
import { ButtonComponent } from '../../shared/ui/button/button';
import { BadgeComponent } from '../../shared/ui/badge/badge';
import { ModalComponent } from '../../shared/ui/modal/modal';
import { PaginatorComponent } from '../../shared/ui/paginator/paginator';
import { HasRoleDirective } from '../../shared/directives/has-role.directive';

interface EmployeeForm {
  name: string;
  email: string;
  position: string;
  departmentId: string;
  role: Role;
  status: EmployeeStatus;
  salary: number;
  phone: string;
  location: string;
}

@Component({
  selector: 'app-users',
  imports: [
    FormsModule,
    CardComponent,
    ButtonComponent,
    BadgeComponent,
    ModalComponent,
    PaginatorComponent,
    HasRoleDirective,
  ],
  templateUrl: './users.html',
  styleUrl: './users.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent {
  private readonly tenantCtx = inject(TenantContextService);
  protected readonly store = inject(DataStoreService);

  protected readonly roles = ALL_ROLES;
  protected readonly statuses: EmployeeStatus[] = ['Active', 'Invited', 'Suspended'];
  protected readonly money = money;

  protected readonly departments = computed(() =>
    this.store.departments().filter(
      (d) => d.tenantId === this.tenantCtx.activeTenant()?.id,
    ),
  );

  protected readonly people = computed(() =>
    this.store
      .employees()
      .filter((e) => e.tenantId === this.tenantCtx.activeTenant()?.id),
  );

  protected readonly pageSize = 8;
  protected readonly page = signal(1);
  protected readonly pageItems = computed(() =>
    paginate(this.people(), this.page(), this.pageSize),
  );

  exportCsv(): void {
    const tenant = this.tenantCtx.activeTenant()?.name ?? 'tenant';
    exportCsv(
      `employees-${tenant.toLowerCase().replace(/\s+/g, '-')}`,
      this.people(),
      [
        { header: 'Name', value: (e) => e.name },
        { header: 'Email', value: (e) => e.email },
        { header: 'Department', value: (e) => this.deptName(e.departmentId) },
        { header: 'Role', value: (e) => e.role },
        { header: 'Status', value: (e) => e.status },
        { header: 'Salary (PKR)', value: (e) => e.salary },
        { header: 'Phone', value: (e) => e.phone },
        { header: 'Location', value: (e) => e.location },
        { header: 'Joined', value: (e) => e.joinedAt },
      ],
    );
  }

  /** null = closed, object without id = "add new", object with id = "edit" */
  protected readonly editing = signal<(EmployeeForm & { id: string | null }) | null>(
    null,
  );
  protected readonly deleting = signal<Employee | null>(null);
  protected readonly toast = signal('');

  deptName(id: string): string {
    return this.store.departmentName(id);
  }

  startAdd(): void {
    const firstDept = this.departments()[0]?.id ?? '';
    this.editing.set({
      id: null,
      name: '',
      email: '',
      position: '',
      departmentId: firstDept,
      role: 'Employee',
      status: 'Invited',
      salary: 240000,
      phone: '',
      location: '',
    });
  }

  startEdit(emp: Employee): void {
    this.editing.set({
      id: emp.id,
      name: emp.name,
      email: emp.email,
      position: emp.position,
      departmentId: emp.departmentId,
      role: emp.role,
      status: emp.status,
      salary: emp.salary,
      phone: emp.phone,
      location: emp.location,
    });
  }

  saveEdit(): void {
    const form = this.editing();
    if (!form || !form.name.trim() || !form.email.trim()) {
      return;
    }
    if (form.id) {
      this.store.updateEmployee(form.id, {
        name: form.name.trim(),
        email: form.email.trim(),
        position: form.position,
        departmentId: form.departmentId,
        role: form.role,
        status: form.status,
        salary: Number(form.salary) || 0,
        phone: form.phone,
        location: form.location,
      });
      this.toast.set(`Saved changes to ${form.name}.`);
    } else {
      this.store.addEmployee({
        name: form.name.trim(),
        email: form.email.trim(),
        position: form.position,
        departmentId: form.departmentId,
        role: form.role,
        status: form.status,
        salary: Number(form.salary) || 0,
        phone: form.phone,
        location: form.location,
        managerId: null,
        joinedAt: new Date().toISOString().slice(0, 10),
        tenantId: this.tenantCtx.activeTenant()?.id ?? 'orient',
      });
      this.toast.set(`Added ${form.name} to the directory.`);
      this.page.set(1);
    }
    this.editing.set(null);
    this.clearToastSoon();
  }

  confirmDelete(): void {
    const emp = this.deleting();
    if (!emp) {
      return;
    }
    this.store.deleteEmployee(emp.id);
    this.toast.set(`Removed ${emp.name} from the directory.`);
    this.deleting.set(null);
    this.clearToastSoon();
  }

  private clearToastSoon(): void {
    setTimeout(() => this.toast.set(''), 3000);
  }
}
