import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FeatureKey, Tenant } from '../models/tenant.model';
import { AuthService } from './auth.service';
import { DataStoreService } from './data-store.service';

/**
 * Holds the currently active tenant and its runtime configuration. Tenants come
 * from the API (SQL Server); feature toggles are persisted back through it.
 */
@Injectable({ providedIn: 'root' })
export class TenantContextService {
  private readonly auth = inject(AuthService);
  private readonly store = inject(DataStoreService);
  private readonly doc = inject(DOCUMENT);

  private readonly _activeTenantId = signal<string | null>(null);

  /** Tenants the signed-in user is allowed to access. */
  readonly availableTenants = computed<Tenant[]>(() => {
    const user = this.auth.user();
    if (!user) {
      return [];
    }
    return this.store.tenants().filter((t) => user.tenantIds.includes(t.id));
  });

  readonly activeTenant = computed<Tenant | null>(() => {
    const tenants = this.availableTenants();
    const id = this._activeTenantId();
    return tenants.find((t) => t.id === id) ?? tenants[0] ?? null;
  });

  constructor() {
    effect(() => {
      const tenants = this.availableTenants();
      const current = this._activeTenantId();
      if (tenants.length === 0) {
        if (current !== null) {
          this._activeTenantId.set(null);
        }
        return;
      }
      if (!tenants.some((t) => t.id === current)) {
        this._activeTenantId.set(tenants[0].id);
      }
    });

    effect(() => {
      const tenant = this.activeTenant();
      this.doc.documentElement.style.setProperty(
        '--color-brand',
        tenant?.branding.primary ?? 'var(--c-clay)',
      );
    });
  }

  setActiveTenant(tenantId: string): void {
    if (this.availableTenants().some((t) => t.id === tenantId)) {
      this._activeTenantId.set(tenantId);
    }
  }

  isFeatureEnabled(feature: FeatureKey): boolean {
    return this.activeTenant()?.enabledFeatures.includes(feature) ?? false;
  }

  /** Enable/disable a feature for the active tenant (persisted via the API). */
  toggleFeature(feature: FeatureKey, enabled: boolean): void {
    const tenant = this.activeTenant();
    if (!tenant || feature === 'dashboard') {
      return; // dashboard is always on
    }
    const set = new Set(tenant.enabledFeatures);
    if (enabled) {
      set.add(feature);
    } else {
      set.delete(feature);
    }
    void this.store.setTenantFeatures(tenant.id, [...set]);
  }
}
