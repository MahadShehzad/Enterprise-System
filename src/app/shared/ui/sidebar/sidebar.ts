import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavItem } from '../../../core/models/nav-item.model';
import { Tenant } from '../../../core/models/tenant.model';

@Component({
  selector: 'ui-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  readonly items = input.required<NavItem[]>();
  readonly tenants = input.required<Tenant[]>();
  readonly activeTenant = input<Tenant | null>(null);

  readonly tenantChange = output<string>();

  onTenantSelect(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.tenantChange.emit(value);
  }
}
