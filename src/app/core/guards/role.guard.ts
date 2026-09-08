import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/role.model';

export interface RoleRouteData {
  /** Minimum role required (hierarchical). */
  minRole?: Role;
  /** Explicit set of allowed roles (takes precedence over minRole). */
  allowedRoles?: Role[];
}

/**
 * Blocks navigation when the current role is not permitted for the route.
 * Configure via `data: { minRole: 'Manager' }` or `data: { allowedRoles: [...] }`.
 */
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const data = (route.data ?? {}) as RoleRouteData;

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  const permitted = data.allowedRoles
    ? auth.hasAnyRole(data.allowedRoles)
    : data.minRole
      ? auth.hasMinRole(data.minRole)
      : true;

  return permitted ? true : router.createUrlTree(['/app/forbidden']);
};
