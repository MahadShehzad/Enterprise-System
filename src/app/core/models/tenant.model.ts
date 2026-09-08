/** A feature key that can be enabled/disabled per tenant. */
export type FeatureKey = 'dashboard' | 'users' | 'reports' | 'settings';

export interface TenantBranding {
  /** Primary brand colour used for accents in the active tenant. */
  primary: string;
  /** Short label shown in the sidebar badge. */
  shortName: string;
}

export interface Tenant {
  id: string;
  name: string;
  branding: TenantBranding;
  /** Features this tenant has purchased / enabled. */
  enabledFeatures: FeatureKey[];
}
