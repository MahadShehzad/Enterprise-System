import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { TenantContextService } from '../../core/services/tenant-context.service';
import { DataStoreService } from '../../core/services/data-store.service';
import { Project, ProjectStatus } from '../../core/models/hr.model';
import { prettyDate } from '../../core/utils/format';
import { exportCsv } from '../../core/utils/csv';
import { paginate } from '../../core/utils/paginate';
import { CardComponent } from '../../shared/ui/card/card';
import { ButtonComponent } from '../../shared/ui/button/button';
import { BadgeComponent } from '../../shared/ui/badge/badge';
import { ModalComponent } from '../../shared/ui/modal/modal';
import { PaginatorComponent } from '../../shared/ui/paginator/paginator';

interface ProjectForm {
  id: string | null;
  name: string;
  client: string;
  status: ProjectStatus;
  progress: number;
  dueDate: string;
  memberIds: string[];
}

@Component({
  selector: 'app-projects',
  imports: [
    FormsModule,
    CardComponent,
    ButtonComponent,
    BadgeComponent,
    ModalComponent,
    PaginatorComponent,
  ],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsComponent {
  private readonly auth = inject(AuthService);
  private readonly tenantCtx = inject(TenantContextService);
  protected readonly store = inject(DataStoreService);
  protected readonly prettyDate = prettyDate;

  protected readonly statuses: ProjectStatus[] = [
    'Planning',
    'In progress',
    'On hold',
    'Done',
  ];

  protected readonly candidates = computed(() =>
    this.store
      .employees()
      .filter((e) => e.tenantId === this.tenantCtx.activeTenant()?.id),
  );

  protected readonly projects = computed(() => this.store.projects());

  protected readonly pageSize = 6;
  protected readonly page = signal(1);
  protected readonly pageItems = computed(() =>
    paginate(this.projects(), this.page(), this.pageSize),
  );

  protected readonly editing = signal<ProjectForm | null>(null);
  protected readonly deleting = signal<Project | null>(null);
  protected readonly toast = signal('');

  exportCsv(): void {
    exportCsv('projects', this.projects(), [
      { header: 'Project', value: (p) => p.name },
      { header: 'Client', value: (p) => p.client },
      { header: 'Status', value: (p) => p.status },
      { header: 'Progress (%)', value: (p) => p.progress },
      { header: 'Due date', value: (p) => p.dueDate },
      { header: 'Team', value: (p) => this.memberNames(p.memberIds) },
    ]);
  }

  memberNames(ids: string[]): string {
    return (
      ids
        .map((id) => this.store.employeeById(id)?.name)
        .filter(Boolean)
        .join(', ') || 'No members'
    );
  }

  tone(status: ProjectStatus): 'success' | 'warning' | 'neutral' | 'brand' {
    return status === 'In progress'
      ? 'success'
      : status === 'On hold'
        ? 'warning'
        : status === 'Done'
          ? 'neutral'
          : 'brand';
  }

  startAdd(): void {
    this.editing.set({
      id: null,
      name: '',
      client: '',
      status: 'Planning',
      progress: 0,
      dueDate: new Date().toISOString().slice(0, 10),
      memberIds: [],
    });
  }

  startEdit(p: Project): void {
    this.editing.set({
      id: p.id,
      name: p.name,
      client: p.client,
      status: p.status,
      progress: p.progress,
      dueDate: p.dueDate,
      memberIds: [...p.memberIds],
    });
  }

  toggleMember(id: string, checked: boolean): void {
    const f = this.editing();
    if (!f) {
      return;
    }
    f.memberIds = checked
      ? [...f.memberIds, id]
      : f.memberIds.filter((m) => m !== id);
  }

  save(): void {
    const f = this.editing();
    if (!f || !f.name.trim()) {
      return;
    }
    const progress = Math.max(0, Math.min(100, Number(f.progress) || 0));
    if (f.id) {
      this.store.updateProject(f.id, {
        name: f.name.trim(),
        client: f.client,
        status: f.status,
        progress,
        dueDate: f.dueDate,
        memberIds: f.memberIds,
      });
      this.toast.set(`Updated "${f.name}".`);
    } else {
      this.store.addProject({
        name: f.name.trim(),
        client: f.client || 'Internal',
        status: f.status,
        progress,
        dueDate: f.dueDate,
        leadId: this.auth.user()?.employeeId ?? '',
        memberIds: f.memberIds,
      });
      this.toast.set(`Created "${f.name}".`);
    }
    this.editing.set(null);
    this.flash();
  }

  confirmDelete(): void {
    const p = this.deleting();
    if (!p) {
      return;
    }
    this.store.deleteProject(p.id);
    this.toast.set(`Deleted "${p.name}".`);
    this.deleting.set(null);
    this.flash();
  }

  private flash(): void {
    setTimeout(() => this.toast.set(''), 2800);
  }
}
