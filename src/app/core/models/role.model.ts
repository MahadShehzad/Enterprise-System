/** Roles supported by the RBAC system, ordered least -> most privileged. */
export type Role = 'Viewer' | 'Employee' | 'Manager' | 'Admin';

export const ROLE_RANK: Record<Role, number> = {
  Viewer: 1,
  Employee: 2,
  Manager: 3,
  Admin: 4,
};

export const ALL_ROLES: Role[] = ['Viewer', 'Employee', 'Manager', 'Admin'];

/** True when `role` is at least as privileged as `required`. */
export function roleSatisfies(role: Role, required: Role): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[required];
}

/** True when `role` is one of the explicitly allowed roles. */
export function roleAllowed(role: Role, allowed: readonly Role[]): boolean {
  return allowed.includes(role);
}
