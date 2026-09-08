import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TenantContextService } from '../../core/services/tenant-context.service';
import { FeatureKey } from '../../core/models/tenant.model';
import { CardComponent } from '../../shared/ui/card/card';
import { BadgeComponent } from '../../shared/ui/badge/badge';

interface FeatureRow {
  key: FeatureKey;
  label: string;
  description: string;
  locked: boolean;
}

@Component({
  selector: 'app-settings',
  imports: [CardComponent, BadgeComponent],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  protected readonly tenantCtx = inject(TenantContextService);

  protected readonly features: FeatureRow[] = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      description: 'Always available to every tenant.',
      locked: true,
    },
    {
      key: 'users',
      label: 'Users',
      description: 'Team directory and role management.',
      locked: false,
    },
    {
      key: 'reports',
      label: 'Reports',
      description: 'Analytics workspace and CSV export.',
      locked: false,
    },
    {
      key: 'settings',
      label: 'Settings',
      description: 'This page. Disabling it hides it after you navigate away.',
      locked: false,
    },
  ];

  isEnabled(key: FeatureKey): boolean {
    return this.tenantCtx.isFeatureEnabled(key);
  }

  onToggle(key: FeatureKey, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.tenantCtx.toggleFeature(key, checked);
  }
}
