import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FeatureKey, Tenant } from '../models/tenant.model';
import { TENANTS } from '../data/mock-data';
import { AuthService } from './auth.service';

/**
 * Holds the currently active tenant and its runtime configuration. Every
 * tenant-aware service should read `activeTenant()` rather than taking a tenant
 * id as a parameter.
 */
@Injectable({ providedIn: 'root' })
export class TenantContextService {
  private readonly auth = inject(AuthService);
  private readonly doc = inject(DOCUMENT);

  /** Mutable working copy so feature toggles can drive dynamic module loading. */
  private readonly _tenants = signal<Tenant[]>(
    TENANTS.map((t) => ({
      ...t,
      branding: { ...t.branding },
      enabledFeatures: [...t.enabledFeatures],
    })),
  );

  private readonly _activeTenantId = signal<string | null>(null);

  /** Tenants the signed-in user is allowed to access. */
  readonly availableTenants = computed<Tenant[]>(() => {
    const user = this.auth.user();
    if (!user) {
      return [];
    }
    return this._tenants().filter((t) => user.tenantIds.includes(t.id));
  });

  readonly activeTenant = computed<Tenant | null>(() => {
    const tenants = this.availableTenants();
    const id = this._activeTenantId();
    // Fall back to the first available tenant so route guards that run before
    // the sync effect fires still see a valid tenant.
    return tenants.find((t) => t.id === id) ?? tenants[0] ?? null;
  });

  constructor() {
    // Keep the active tenant valid as the user (and thus their tenants) changes.
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

    // Apply tenant branding to a CSS custom property.
    effect(() => {
      const tenant = this.activeTenant();
      this.doc.documentElement.style.setProperty(
        '--color-brand',
        tenant?.branding.primary ?? 'var(--c-mauve)',
      );
    });
  }

  setActiveTenant(tenantId: string): void {
    if (this.availableTenants().some((t) => t.id === tenantId)) {
      this._activeTenantId.set(tenantId);
    }
  }

  /** True when the active tenant has purchased/enabled a feature. */
  isFeatureEnabled(feature: FeatureKey): boolean {
    return this.activeTenant()?.enabledFeatures.includes(feature) ?? false;
  }

  /** Enable/disable a feature for the active tenant at runtime. */
  toggleFeature(feature: FeatureKey, enabled: boolean): void {
    const activeId = this.activeTenant()?.id;
    if (!activeId || feature === 'dashboard') {
      return; // dashboard is always on
    }
    this._tenants.update((tenants) =>
      tenants.map((t) => {
        if (t.id !== activeId) {
          return t;
        }
        const set = new Set(t.enabledFeatures);
        if (enabled) {
          set.add(feature);
        } else {
          set.delete(feature);
        }
        return { ...t, enabledFeatures: [...set] };
      }),
    );
  }
}
