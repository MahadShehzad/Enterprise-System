import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Role, roleAllowed, roleSatisfies } from '../models/role.model';
import { EditableProfile, User } from '../models/user.model';

const SESSION_KEY = 'acme-admin:user';

export type LoginResult = { ok: true } | { ok: false; error: string };

/**
 * Authentication against the API. `login` posts credentials to the SQL Server
 * backed API; the returned user (no password) is cached in sessionStorage so a
 * refresh keeps you signed in without another round-trip.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly _user = signal<User | null>(this.restore());

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly role = computed<Role | null>(() => this._user()?.role ?? null);

  constructor() {
    effect(() => {
      const user = this._user();
      try {
        if (user) {
          globalThis.sessionStorage?.setItem(SESSION_KEY, JSON.stringify(user));
        } else {
          globalThis.sessionStorage?.removeItem(SESSION_KEY);
        }
      } catch {
        /* storage unavailable */
      }
    });
  }

  async login(email: string, password: string): Promise<LoginResult> {
    try {
      const user = await firstValueFrom(
        this.http.post<User>('/api/auth/login', { email, password }),
      );
      this._user.set(user);
      return { ok: true };
    } catch (err: unknown) {
      const message =
        (err as { error?: { error?: string } })?.error?.error ??
        'Could not sign in. Is the API running?';
      return { ok: false, error: message };
    }
  }

  logout(): void {
    this._user.set(null);
  }

  async updateProfile(patch: EditableProfile): Promise<void> {
    const current = this._user();
    if (!current) return;
    const updated = await firstValueFrom(
      this.http.put<User>(`/api/users/${current.id}/profile`, {
        name: patch.name,
        email: patch.email,
        title: patch.title,
        department: patch.department,
        phone: patch.phone,
        location: patch.location,
        bio: patch.bio,
      }),
    );
    this._user.set(updated);
  }

  async setAvatar(dataUrl: string): Promise<void> {
    const current = this._user();
    if (!current) return;
    const updated = await firstValueFrom(
      this.http.put<User>(`/api/users/${current.id}/avatar`, {
        avatarUrl: dataUrl,
      }),
    );
    this._user.set(updated);
  }

  hasMinRole(required: Role): boolean {
    const current = this.role();
    return current !== null && roleSatisfies(current, required);
  }

  hasAnyRole(allowed: readonly Role[]): boolean {
    const current = this.role();
    return current !== null && roleAllowed(current, allowed);
  }

  private restore(): User | null {
    try {
      const raw = globalThis.sessionStorage?.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}
