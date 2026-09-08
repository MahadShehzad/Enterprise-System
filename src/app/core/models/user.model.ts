import { Role } from './role.model';

export interface UserProfile {
  title: string;
  department: string;
  phone: string;
  location: string;
  bio: string;
  joinedAt: string;
  /** Data-URL of an uploaded avatar image, or '' for the initials fallback. */
  avatarUrl: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  /** Mock credential – checked by AuthService.login. Never do this in real code. */
  password: string;
  role: Role;
  /** Tenants this user belongs to. */
  tenantIds: string[];
  /** Links this account to a row in the employee directory, when applicable. */
  employeeId: string | null;
  profile: UserProfile;
}

/** Fields the user may change on their own profile. */
export type EditableProfile = Pick<
  User,
  'name' | 'email'
> &
  Pick<UserProfile, 'title' | 'department' | 'phone' | 'location' | 'bio'>;

/** Uppercase initials for avatar placeholders, e.g. "Ayesha Khan" -> "AK". */
export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
