import { Injectable, computed, inject } from '@angular/core';
import { NavItem } from '../models/nav-item.model';
import { NAV_CATALOGUE } from '../data/nav-catalogue';
import { AuthService } from './auth.service';
import { TenantContextService } from './tenant-context.service';

/**
 * Config-driven navigation. The visible menu is derived from:
 *   1. the current user's role, and
 *   2. the features enabled for the active tenant.
 * This is the "dynamic module loading" mechanism – routes/components only
 * appear when both conditions are met.
 */
@Injectable({ providedIn: 'root' })
export class NavigationService {
  private readonly auth = inject(AuthService);
  private readonly tenantCtx = inject(TenantContextService);

  readonly visibleItems = computed<NavItem[]>(() => {
    const role = this.auth.role();
    const tenant = this.tenantCtx.activeTenant();
    if (!role || !tenant) {
      return [];
    }
    return NAV_CATALOGUE.filter(
      (item) =>
        item.roles.includes(role) &&
        tenant.enabledFeatures.includes(item.feature),
    );
  });

  /** Used by guards to check whether a feature route is reachable right now. */
  canAccess(path: string): boolean {
    return this.visibleItems().some((item) => path.startsWith(item.path));
  }
}
