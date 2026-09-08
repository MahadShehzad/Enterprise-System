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
import { money } from '../../core/utils/format';
import { exportCsv } from '../../core/utils/csv';
import { CardComponent } from '../../shared/ui/card/card';
import { ButtonComponent } from '../../shared/ui/button/button';
import { ModalComponent } from '../../shared/ui/modal/modal';

@Component({
  selector: 'app-departments',
  imports: [FormsModule, CardComponent, ButtonComponent, ModalComponent],
  templateUrl: './departments.html',
  styleUrl: './departments.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepartmentsComponent {
  private readonly tenantCtx = inject(TenantContextService);
  protected readonly store = inject(DataStoreService);
  protected readonly money = money;

  private readonly tenantId = computed(
    () => this.tenantCtx.activeTenant()?.id ?? 'orient',
  );

  protected readonly employees = computed(() =>
    this.store.employees().filter((e) => e.tenantId === this.tenantId()),
  );

  protected readonly rows = computed(() =>
    this.store
      .departments()
      .filter((d) => d.tenantId === this.tenantId())
      .map((d) => {
        const people = this.employees().filter((e) => e.departmentId === d.id);
        return {
          ...d,
          headcount: people.length,
          payroll: people.reduce((s, e) => s + e.salary, 0),
          people,
        };
      }),
  );

  protected readonly totalPayroll = computed(() =>
    this.employees().reduce((s, e) => s + e.salary, 0),
  );

  protected readonly editing = signal<
    { id: string | null; name: string; lead: string } | null
  >(null);
  protected readonly toast = signal('');

  exportCsv(): void {
    exportCsv('departments-summary', this.rows(), [
      { header: 'Department', value: (d) => d.name },
      { header: 'Lead', value: (d) => d.lead },
      { header: 'Headcount', value: (d) => d.headcount },
      { header: 'Annual payroll (PKR)', value: (d) => d.payroll },
    ]);
  }

  startAdd(): void {
    this.editing.set({ id: null, name: '', lead: '' });
  }

  startEdit(id: string, name: string, lead: string): void {
    this.editing.set({ id, name, lead });
  }

  save(): void {
    const form = this.editing();
    if (!form || !form.name.trim()) {
      return;
    }
    if (form.id) {
      this.store.departments.update((list) =>
        list.map((d) =>
          d.id === form.id ? { ...d, name: form.name.trim(), lead: form.lead } : d,
        ),
      );
      this.toast.set(`Updated ${form.name}.`);
    } else {
      this.store.departments.update((list) => [
        ...list,
        {
          id: `dept-new-${Date.now().toString(36)}`,
          name: form.name.trim(),
          lead: form.lead || '—',
          tenantId: this.tenantId(),
        },
      ]);
      this.toast.set(`Added ${form.name}.`);
    }
    this.editing.set(null);
    setTimeout(() => this.toast.set(''), 2800);
  }
}
