import { Injectable, computed, effect, signal } from '@angular/core';
import { Role, roleAllowed, roleSatisfies } from '../models/role.model';
import { EditableProfile, User } from '../models/user.model';
import { USERS } from '../data/mock-data';

const SESSION_KEY = 'acme-admin:user-id';
const OVERRIDES_KEY = 'acme-admin:user-overrides';

export type LoginResult = { ok: true } | { ok: false; error: string };

type UserOverride = Partial<Pick<User, 'name' | 'email'>> & {
  profile?: Partial<User['profile']>;
};

/**
 * Mocked authentication / role provider. No backend – `login` matches the
 * email + password against the seeded demo accounts. Profile edits and the
 * uploaded avatar are kept as per-user overrides in sessionStorage so they
 * survive a refresh.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly overrides = signal<Record<string, UserOverride>>(
    this.restoreOverrides(),
  );

  private readonly _user = signal<User | null>(this.restoreUser());

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly role = computed<Role | null>(() => this._user()?.role ?? null);

  readonly demoAccounts = USERS.map((u) => ({
    name: u.name,
    email: u.email,
    password: u.password,
    role: u.role,
  }));

  constructor() {
    effect(() => {
      const user = this._user();
      try {
        if (user) {
          globalThis.sessionStorage?.setItem(SESSION_KEY, user.id);
        } else {
          globalThis.sessionStorage?.removeItem(SESSION_KEY);
        }
      } catch {
        /* storage unavailable */
      }
    });

    effect(() => {
      try {
        globalThis.sessionStorage?.setItem(
          OVERRIDES_KEY,
          JSON.stringify(this.overrides()),
        );
      } catch {
        /* storage unavailable */
      }
    });
  }

  login(email: string, password: string): LoginResult {
    const normalised = email.trim().toLowerCase();
    const match = USERS.find((u) => u.email.toLowerCase() === normalised);
    if (!match) {
      return { ok: false, error: 'No account found for that email address.' };
    }
    if (match.password !== password) {
      return { ok: false, error: 'Incorrect password. Please try again.' };
    }
    this._user.set(this.applyOverride(match));
    return { ok: true };
  }

  logout(): void {
    this._user.set(null);
  }

  /** Persist edited profile fields for the current user. */
  updateProfile(patch: EditableProfile): void {
    const current = this._user();
    if (!current) {
      return;
    }
    this.mergeOverride(current.id, {
      name: patch.name,
      email: patch.email,
      profile: {
        title: patch.title,
        department: patch.department,
        phone: patch.phone,
        location: patch.location,
        bio: patch.bio,
      },
    });
  }

  /** Store an uploaded avatar (data URL) for the current user. */
  setAvatar(dataUrl: string): void {
    const current = this._user();
    if (!current) {
      return;
    }
    this.mergeOverride(current.id, { profile: { avatarUrl: dataUrl } });
  }

  hasMinRole(required: Role): boolean {
    const current = this.role();
    return current !== null && roleSatisfies(current, required);
  }

  hasAnyRole(allowed: readonly Role[]): boolean {
    const current = this.role();
    return current !== null && roleAllowed(current, allowed);
  }

  /* ---- internals ---------------------------------------------------- */

  private mergeOverride(userId: string, patch: UserOverride): void {
    this.overrides.update((all) => {
      const prev = all[userId] ?? {};
      return {
        ...all,
        [userId]: {
          ...prev,
          ...patch,
          profile: { ...prev.profile, ...patch.profile },
        },
      };
    });
    const base = USERS.find((u) => u.id === userId);
    if (base) {
      this._user.set(this.applyOverride(base));
    }
  }

  private applyOverride(base: User): User {
    const ov = this.overrides()[base.id];
    if (!ov) {
      return { ...base, profile: { ...base.profile } };
    }
    return {
      ...base,
      name: ov.name ?? base.name,
      email: ov.email ?? base.email,
      profile: { ...base.profile, ...ov.profile },
    };
  }

  private restoreUser(): User | null {
    try {
      const id = globalThis.sessionStorage?.getItem(SESSION_KEY);
      const base = USERS.find((u) => u.id === id);
      return base ? this.applyOverride(base) : null;
    } catch {
      return null;
    }
  }

  private restoreOverrides(): Record<string, UserOverride> {
    try {
      const raw = globalThis.sessionStorage?.getItem(OVERRIDES_KEY);
      return raw ? (JSON.parse(raw) as Record<string, UserOverride>) : {};
    } catch {
      return {};
    }
  }
}
