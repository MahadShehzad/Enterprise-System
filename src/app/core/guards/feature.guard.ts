import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TenantContextService } from '../services/tenant-context.service';
import { FeatureKey } from '../models/tenant.model';

export interface FeatureRouteData {
  feature?: FeatureKey;
}

/**
 * Blocks a feature route when the active tenant does not have that feature
 * enabled – the runtime "dynamic module loading" gate.
 */
export const featureGuard: CanActivateFn = (route) => {
  const tenantCtx = inject(TenantContextService);
  const router = inject(Router);
  const feature = (route.data as FeatureRouteData | undefined)?.feature;

  if (!feature || tenantCtx.isFeatureEnabled(feature)) {
    return true;
  }
  return router.createUrlTree(['/app/forbidden']);
};
